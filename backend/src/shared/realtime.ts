import { redis } from "@/lib/redis/redis";

export async function publishGroupEvent(
  groupId: string,
  event: Record<string, unknown>,
) {
  await redis.publish(`group:${groupId}:events`, JSON.stringify(event));
}
