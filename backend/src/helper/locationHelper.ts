import { prisma } from "@/lib/prisma";
import {
  getCachedData,
  setCachedData,
  deleteCachedData,
  cacheKeys,
  CacheTTL,
} from "@/lib/redis/cache";
import type { FastifyRequest } from "fastify";

export type UserLocation = {
  latitude: number;
  longitude: number;
  selectedDistance: number;
};

/**
 * Retrieves user location either from Redis cache or PostgreSQL database.
 * Accepts either a userId string or a FastifyRequest containing authUser/user.
 */
export async function getUserLocation(
  input: string | FastifyRequest,
): Promise<UserLocation | null> {
  try {
    const userId = typeof input === "string" ? input : (input.authUser?.id ?? input.user?.id);

    if (!userId) return null;

    const key = cacheKeys.userLocation(userId);

    // 1. Try Redis cache first
    const cached = await getCachedData<UserLocation>(key);
    if (cached) return cached;

    // 2. Cache miss -> query DB
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        latitude: true,
        longitude: true,
        selectedDistance: true,
      },
    });

    if (!dbUser || dbUser.latitude === null || dbUser.longitude === null) {
      return null;
    }

    const locationData: UserLocation = {
      latitude: dbUser.latitude,
      longitude: dbUser.longitude,
      selectedDistance: dbUser.selectedDistance ?? 25,
    };

    // 3. Cache the location in Redis (10 mins TTL)
    await setCachedData(key, locationData, CacheTTL.userLocation);

    return locationData;
  } catch (error) {
    console.error(`[getUserLocation] Error fetching location:`, error);
    return null;
  }
}

/**
 * Explicitly set/update the location cache for a user in Redis
 */
export async function setUserLocationCache(
  userId: string,
  data: UserLocation,
): Promise<void> {
  const key = cacheKeys.userLocation(userId);
  await setCachedData(key, data, CacheTTL.userLocation);
}

/**
 * Invalidate the location cache for a user in Redis
 */
export async function invalidateUserLocationCache(
  userId: string,
): Promise<void> {
  const key = cacheKeys.userLocation(userId);
  await deleteCachedData(key);
}