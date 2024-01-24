import amqp from "amqplib";
import logger from "../utils/logger.util";

let connection: amqp.Connection;
let channel: amqp.Channel;

export const DEAD_LETTER = {
  exchange: "dead.letter.exchange",
  queue: "dead.letter.queue",
};

const subscriber = {
  async init(amqpUrl: string) {
    if (connection && channel) {
      return;
    }

    if (!connection && !amqpUrl) {
      throw new Error("AMQP URL is required");
    }

    // set connection heartbeat to 60 seconds
    const connectionUrl = `${amqpUrl}?heartbeat=60`;

    if (!connection) {
      connection = await amqp.connect(connectionUrl);
    }

    // close channel if it exists
    if (channel) {
      await channel.close();
    }

    // create new channel
    channel = await connection.createChannel();

    logger.info("Event Bus connected successfully");
  },

  isEventBusInitialized() {
    if (!this.isInitialized()) {
      throw new Error(
        "Please initialize the Event Bus by calling `.init()` before attempting to use the Event Bus.",
      );
    }
  },

  isInitialized() {
    if (connection || channel) return true;
    return false;
  },

  async close() {
    this.isEventBusInitialized();

    if (channel) await channel.close();
    if (connection) await connection.close();
  },

  getChannel() {
    this.isEventBusInitialized();
    return channel;
  },

  getConnection() {
    this.isEventBusInitialized();
    return connection;
  },

  /**
   * Emits an event via the passed-in `exchange`
   * Works as a pub-sub publisher.
   * @param exchange Exhange to emit the event on
   * @param event Event to be emitted (routing key)
   * @param data The data to be emitted
   * @param options RabbitMQ Publish options
   * @returns {Promise<boolean>}
   */
  async emit(
    exchange: string,
    event: string,
    data: Record<string, unknown>,
    options?: amqp.Options.Publish,
  ) {
    this.isEventBusInitialized();
    await channel.assertExchange(exchange, "topic");
    const message = Buffer.from(JSON.stringify(data));
    return channel.publish(exchange, event, message, options);
  },

  /**
   * Pushes data to the queue `queueName`
   * @param queueName Queue to push data to
   * @param data Data to be pushed to queue `queueName`
   * @param options RabbitMQ Publish options
   * Messages are persistent by default.
   * @return {boolean}
   */
  async queue(
    queueName: string,
    data: Record<string, unknown>,
    options?: amqp.Options.Publish,
  ) {
    this.isEventBusInitialized();
    await channel.assertQueue(queueName, { durable: true });
    const message = Buffer.from(JSON.stringify(data));
    return channel.sendToQueue(queueName, message, {
      persistent: true,
      ...options,
    });
  },

  /**
   * Listens for an `event` on an `exchange` and invokes the provided `callback` when
   * the event gets emitted.
   * Works as a pub-sub subscriber.
   * @param exchange Exchange to listen for events on
   * @param event Event to be consumed (routing key)
   * @param callback Callback to be invoked when event gets emitted
   * @returns {Promise<amqp.Replies.Consume>} AMQP reply
   */
  async on(
    exchange: string,
    event: string,
    callback: (msg: amqp.ConsumeMessage | null) => void,
  ) {
    this.isEventBusInitialized();

    await channel.assertExchange(exchange, "topic");

    // create temporary queue that gets deleted when connection closes
    const { queue } = await channel.assertQueue("", {
      exclusive: true,
    });

    await channel.bindQueue(queue, exchange, event);

    return channel.consume(queue, callback, {
      noAck: true,
    });
  },

  /**
   * Consumes tasks/messages from a queue `queueName` and invokes the provided callback
   * @param queueName Queue to consume tasks from
   * @param callback Callback to be invoked for each message that gets sent to the queue
   * @param limit The number of concurrent jobs the consumer can handle. Defaults to 3
   * @param retries The number of times a message should be retried before being rejected.
   * @param options Optional options. If the noAck option is set to true or not specified,
   * you are expected to call channel.ack(message) at the end of the supplied
   * callback inorder to notify the queue that the message has been acknowledged.
   */
  async consume(
    queueName: string,
    callback: (msg: amqp.ConsumeMessage) => Promise<void> | void,
    limit: number,
    retries: number,
    options?: amqp.Options.Consume,
  ) {
    this.isEventBusInitialized();

    let attempts = 0;

    const retryCallback = async (msg: amqp.ConsumeMessage | null) => {
      try {
        logger.info("Received message");
        if (msg === null) {
          logger.warn("Message is null");
          return;
        }

        await callback(msg); // process message

        this.acknowledgeMessage(msg);
      } catch (error) {
        logger.warn("Error processing message: ", error);
        attempts++;

        if (attempts > retries) {
          logger.warn("Max retries exceeded");
          this.rejectMessage(msg!, false, error as Error);
          return;
        }

        logger.warn(`Retrying message ${attempts} of ${retries}`);
        this.rejectMessage(msg!);
      }
    };
    // limit number of concurrent jobs
    await channel.prefetch(limit);
    await channel.assertQueue(queueName, { durable: true });
    return await channel.consume(queueName, retryCallback, options);
  },

  /**
   * Acknowledges a message.
   * @param message The message to be acknowledged
   */
  acknowledgeMessage(message: amqp.Message) {
    this.isEventBusInitialized();
    channel.ack(message);
  },

  /**
   * Rejects a message and requeues it by default.
   * @param message The message to be reject
   * @param requeue true if the message should be requeued. Defaults to true
   * @param error Optional error to be sent to the dead letter queue
   */
  rejectMessage(message: amqp.Message, requeue = true, error?: Error) {
    this.isEventBusInitialized();
    channel.reject(message, requeue);
    if (!requeue) {
      const content = JSON.stringify({
        queue: message.fields.routingKey,
        message: message.content.toString() || "No message",
        error: `${error?.message}
        ${error?.stack}`,
      });
      channel.publish(
        DEAD_LETTER.exchange,
        DEAD_LETTER.queue,
        Buffer.from(content),
      );
    }
  },
};

export default subscriber;
