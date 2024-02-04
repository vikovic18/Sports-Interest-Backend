import { parseEnv } from "znv";
import z from "zod";

const getEnvSchema = (env = process.env) =>
  parseEnv(env, {
    AMQP_URI: z.string(),
    MONGO_URI: z.string(),
    PORT: z.number().positive().max(65535).default(3000),
    SMTP_HOST: z.string(),
    SMTP_PORT: z.number().positive(),
    SMTP_USER: z.string(),
    SMTP_PASS: z.string(),
    SMTP_FROM: z.string(),
    FRONTEND_ENV: z.string(),
    LOG_LEVEL: z.string(),
    JWT_SECRET: z.string()
  });

export default getEnvSchema;
