import "dotenv/config";
import app from "./app";
import http from "http";
import getEnvSchema from "./config/env.config";
import logger from "./utils/logger.util";
import connectToDb from "./config/database.config";
import registerConsumers from "./queues";
import subscriber from "./queues/queue";
import mailConfig from "config/mail.config";

process.on("uncaughtException", (reason, promise) => {
  logger.error(`Unhandled Exception at: ${promise} reason: ${reason}`);
  process.exit(1);
});

process.once("SIGINT", async () => {
  if (subscriber.isInitialized()) await subscriber.close();
});

const { PORT } = getEnvSchema();

const server = http.createServer(app);

const startApplicationDependencies = async () => {
  try {
    await connectToDb();

    await registerConsumers();
    await mailConfig();
  } catch (error) {
    const errMsg = (error as Error).message;
    logger.error(`Server could not start with error: ${errMsg}`);
    process.exit(1);
  }
};

startApplicationDependencies().then(() => {
  server.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });
});
