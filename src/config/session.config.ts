import RedisStore from "connect-redis";
import type { SessionOptions } from "express-session";
import redisConfig from "./redis.config";

// const sessionConfig: SessionOptions | null = null;

const createSession = (store: RedisStore): SessionOptions => {
  return {
    secret: process.env.SESSION_SECRET as string,
    name: process.env.SESSION_NAME as string,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      signed: true,
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  };
};

const redis = redisConfig();

const getSession = createSession(redis.store);

export default getSession;
