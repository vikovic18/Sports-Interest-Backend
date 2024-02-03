import Redis from "ioredis";
import RedisStore from "connect-redis";

import type { IRedis } from "../interface/redis.interface";

const redisConfig = (): IRedis => {
  try {
    console.log("Connecting to Redis...");
    const redisClient = new Redis({ name: "gsas" });
    const redisStore = new RedisStore({ client: redisClient, prefix: "torris_moe:" });

    // Handle graceful shutdown
    process.on("SIGTERM", () => {
      redisClient.disconnect();
      process.exit(0);
    });
    process.on("SIGINT", () => {
      redisClient.disconnect();
      process.exit(0);
    });

    console.log("Redis connection successful");

    return { store: redisStore, client: redisClient };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Redis connection failed" + error.message);
    }
    process.exit(1);
  }
};

export default redisConfig;
