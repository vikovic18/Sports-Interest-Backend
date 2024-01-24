import getEnvSchema from "../config/env.config";
import queue from "./queue";
import logger from "../utils/logger.util";
import { error } from "console";

async function registerConsumers({ AMQP_URI } = getEnvSchema()) {
  let retries = 0;
  const maxRetries = 5;

  while (retries < maxRetries) {
    try {
      await queue.init(AMQP_URI);
      break;
    } catch (error) {
      retries++;
      logger.warn(
        `Failed to connect to the Event Bus. Retrying ${retries}/${maxRetries}...`,
      );
      await new Promise((res) => setTimeout(res, 5000));
    }
  }

  if (retries === maxRetries) {
    logger.error(
      `Failed to connect to the Event Bus after ${maxRetries} retries. Exiting...`,
    );
    throw error;
  }

  // todo: register queue services here.
}

export default registerConsumers;
