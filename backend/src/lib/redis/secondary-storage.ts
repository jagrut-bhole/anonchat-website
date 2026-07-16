import type { BetterAuthOptions } from "better-auth";
import { redis } from "./redis";

type SecondaryStorage = NonNullable<BetterAuthOptions["secondaryStorage"]>;

const incrementWithTtlScript = `
local value = redis.call("INCR", KEYS[1])
if value == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
return value
`;

export const redisSecondaryStorage: SecondaryStorage = {
  get: (key) => redis.get(key),
  getAndDelete: (key) => redis.getdel(key),
  set: async (key, value, ttl) => {
    if (ttl) {
      await redis.set(key, value, "EX", ttl);
      return;
    }

    await redis.set(key, value);
  },
  delete: (key) => redis.del(key).then(() => undefined),
  increment: (key, ttl) =>
    redis.eval(incrementWithTtlScript, 1, key, ttl.toString()) as Promise<number>,
};
