import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { CacheTTL, cacheKeys, consumeCachedData, setCachedData } from "@/lib/redis/cache";

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function storeChangePasswordOtp(userId: string, otp: string) {
  await setCachedData(
    cacheKeys.verificationCode("change-password", userId),
    hashOtp(otp),
    CacheTTL.otp,
  );
}

export async function consumeChangePasswordOtp(userId: string, otp: string): Promise<boolean> {
  const storedHash = await consumeCachedData<string>(
    cacheKeys.verificationCode("change-password", userId),
  );

  if (!storedHash) return false;

  const actual = Buffer.from(hashOtp(otp));
  const expected = Buffer.from(storedHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
