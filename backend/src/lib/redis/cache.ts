import { redis } from "./redis";

export const cacheKeys = {
  // user cache keys
  userAuth: (userId: string) => `user:auth:${userId}`,
  userLocation: (userId: string) => `user:location:${userId}`,
  userProfile: (userId: string) => `user:profile:${userId}`,

  //presence
  presence: (userId: string) => `presence:${userId}`,

  // matching queue
  matchingQueue: "matching:queue",

  // ── Group Realtime & Membership ──
  group: (groupId: string) => `group:${groupId}`,
  groupMembers: (groupId: string) => `group:${groupId}:members`,
  groupTyping: (groupId: string) => `group:${groupId}:typing`,
  groupOnline: (groupId: string) => `group:${groupId}:online`,

  // Group User membership
  groupMembership: (userId: string, groupId: string) =>
    `group:membership:${userId}:${groupId}`,

  // OTP
  verificationCode: (purpose: string, identifier: string) =>
    `otp:${purpose}:${identifier}`,

  // ratelimiting
  rateLimit: (identifier: string, action: string) =>
    `ratelimit:${action}:${identifier}`,
};

export const CacheTTL = {
  userAuth: 60 * 15, // 15 minutes
  userLocation: 60 * 10, // 10 minutes
  userProfile: 60 * 15, // 15 minutes
  presence: 30, // 30 seconds
  group: 60 * 15, // 15 minutes
  groupMembers: 60 * 30, // 30 minutes
  groupMembership: 60 * 30, // 30 minutes
  typing: 5, // 5 seconds
  otp: 60 * 10, // 10 minutes
};

// ─── Helper: race against a timeout so Redis never blocks the app ──────────
function withTimeout<T>(promise: Promise<T>, ms = 1000): Promise<T | null> {
  const timeout = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), ms),
  );
  return Promise.race([promise, timeout]);
}

// ─── Disabled check ────────────────────────────────────────────────────────
function isRedisDisabled(): boolean {
  return process.env.REDIS_ENABLED === "false";
}

// ─── GET : Retrieve cached data by key ─────────────────────────────────────
export async function getCachedData<T>(key: string): Promise<T | null> {
  if (isRedisDisabled()) return null;

  try {
    const data = await withTimeout(redis.get(key));
    if (data === null) return null;

    try {
      return JSON.parse(data) as T;
    } catch {
      return data as T;
    }
  } catch (error) {
    console.error(`[Cache GET] key=${key}`, error);
    return null;
  }
}

// ─── Set : Store data in cache with optional TTL ───────────────────────────
export async function setCachedData<T>(
  key: string,
  data: T,
  ttl: number = CacheTTL.userAuth,
): Promise<void> {
  if (isRedisDisabled()) return;

  try {
    await withTimeout(redis.set(key, JSON.stringify(data), "EX", ttl));
  } catch (error) {
    console.error(`[Cache SET] key=${key}`, error);
  }
}

// ─── Delete : Store data in cache with optional TTL ───────────────────────────
export async function deleteCachedData(keys: string | string[]): Promise<void> {
  if (isRedisDisabled()) return;

  try {
    const keyList = Array.isArray(keys) ? keys : [keys];
    await withTimeout(redis.del(...keyList));
  } catch (error) {
    console.error(`[Cache DEL] keys=${String(keys)}`, error);
  }
}

export async function consumeCachedData<T>(key: string): Promise<T | null> {
  if (isRedisDisabled()) return null;

  try {
    const data = await withTimeout(redis.getdel(key));
    if (data === null) return null;

    try {
      return JSON.parse(data) as T;
    } catch {
      return data as T;
    }
  } catch (error) {
    console.error(`[Cache GETDEL] key=${key}`, error);
    return null;
  }
}

// ─── RATE LIMITER (Redis-backed) ────────────────────────────────────────────

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}
export async function rateLimit(
  identifier: string,
  action: string,
  maxAttempts: number = 5,
  windowSeconds: number = 900,
): Promise<RateLimitResult> {
  // If Redis is off, allow everything
  if (isRedisDisabled()) {
    return { allowed: true, remaining: maxAttempts, resetInSeconds: 0 };
  }

  const key = cacheKeys.rateLimit(identifier, action);

  try {
    // Atomically increment and set expiry on first hit
    const current = await redis.incr(key);

    // First request in windows — set the TTL
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    const ttl = await redis.ttl(key);
    const allowed = current <= maxAttempts;
    const remaining = Math.max(0, maxAttempts - current);

    return {
      allowed,
      remaining,
      resetInSeconds: ttl > 0 ? ttl : windowSeconds,
    };
  } catch (error) {
    console.error(
      `[RateLimit] identifier=${identifier} action=${action}`,
      error,
    );
    // Fail open — don't block users when Redis is unreachable
    return { allowed: true, remaining: maxAttempts, resetInSeconds: 0 };
  }
}
