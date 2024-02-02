import type RedisStore from "connect-redis";
import type Redis from "ioredis";

export interface IRedis {
  client: Redis
  store: RedisStore
}
