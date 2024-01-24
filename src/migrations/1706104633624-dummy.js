import mongoose from "mongoose";
import getEnvSchema from "../config/env.config";
/**
 * Make any changes you need to make to the database here
 */
const { MONGO_URI } = getEnvSchema();

export async function up () {
  // Write migration here
  await mongoose.connect(MONGO_URI);
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
export async function down () {
  // Write migration here
  await mongoose.connect(MONGO_URI);
}
