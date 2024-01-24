import { parseEnv } from "znv";
import z from "zod";

const getEnvSchema = (env = process.env) =>
  parseEnv(env, {
    AMQP_URI: z.string(),
    MONGO_URI: z.string(),
    PORT: z.number().positive().max(65535).default(3000),
  });

export default getEnvSchema;
