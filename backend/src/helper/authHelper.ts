import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  CacheTTL,
  cacheKeys,
  setCachedData,
  getCachedData,
  deleteCachedData,
} from "@/lib/redis/cache";
import { fromNodeHeaders } from "better-auth/node";
import type { FastifyRequest, FastifyReply } from "fastify";
import { responseHandler } from "@/utils/apiResponse";

export type AuthUser = {
  id: string;
  username: string | null;
  email: string;
  emailVerified: boolean;
  onboardingCompleted: boolean;
};

export async function getAuthenticatedUser(
  request: FastifyRequest,
  reply?: FastifyReply,
): Promise<AuthUser | null> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session) {
      if (reply) {
        responseHandler.sendError(reply, 401, "Unauthorized");
      }
      return null;
    }

    request.session = session.session;

    const userId = session.user.id;
    const key = cacheKeys.userAuth(userId);

    const cached = await getCachedData<AuthUser>(key);
    if (cached) return cached;

    const dbUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
        latitude: true,
        longitude: true
      },
    });

    if (!dbUser) {
      if (reply) {
        responseHandler.sendError(reply, 404, "User not found");
      }
      return null;
    }

    const authUser: AuthUser = {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      emailVerified: dbUser.emailVerified,
      onboardingCompleted: Boolean(
        dbUser.username &&
        dbUser.latitude !== null &&
        dbUser.longitude !== null,
      ),
    };

    await setCachedData(key, authUser, CacheTTL.userAuth);
    return authUser;

  } catch (error: unknown) {
    console.error("Error in getAuthenticatedUser:", error);
    if (reply) {
      responseHandler.sendError(reply, 500, "Internal server error");
    }
    return null;
  }
}

export async function invalidateAuthUserCache(userId: string): Promise<void> {
  await deleteCachedData(cacheKeys.userAuth(userId));
}
