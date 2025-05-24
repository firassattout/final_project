import { Redis } from "@upstash/redis";
import { configDotenv } from "dotenv";

configDotenv();
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;
