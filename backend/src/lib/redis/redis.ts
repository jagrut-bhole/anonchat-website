import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl && process.env.REDIS_ENABLED !== "false") {
  throw new Error("REDIS_URL environment variable is not set");
}

export const redis = new Redis(redisUrl || "redis://localhost:6379", {
  lazyConnect: true,
  connectTimeout: 5_000,
  maxRetriesPerRequest: 1,
  enableReadyCheck: true,
});

redis.on("error", (error) => {
  console.error("[Redis] connection error", error);
});

export async function checkRedisConnection(): Promise<boolean> {
  if (process.env.REDIS_ENABLED === "false") return false;

  try {
    return (await redis.ping()) === "PONG";
  } catch (error) {
    console.error("[Redis] health check failed", error);
    return false;
  }
}
