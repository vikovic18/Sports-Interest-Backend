import mongoose from "mongoose";
import getEnvSchema from "./env.config";
import logger from "../utils/logger.util";

async function connectToDb ({ MONGO_URI } = getEnvSchema()) {
  await mongoose.connect(MONGO_URI);

  logger.info("Database connected successfully");
}

export default connectToDb;
