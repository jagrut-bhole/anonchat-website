import type { FastifyRequest, FastifyReply } from "fastify";
import { getAuthenticatedUser } from "@/helper/authHelper";
import { getUserLocation } from "@/helper/locationHelper";
import { responseHandler } from "@/utils/apiResponse";

/**
 * Fastify preHandler middleware for user authentication.
 * Uses Redis caching under key user:auth:${userId} to prevent repeated DB lookups.
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authUser = await getAuthenticatedUser(request, reply);
  if (!authUser) {
    // getAuthenticatedUser handles sending the error response via reply
    return;
  }

  request.authUser = authUser;
  
  request.user = {
    id: authUser.id,
    email: authUser.email,
    emailVerified: authUser.emailVerified,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;
}

/**
 * Fastify preHandler middleware for requiring user location.
 * Fetches location using Redis caching under key user:location:${userId}.
 */
export async function requireUserLocation(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.authUser?.id ?? request.user?.id;
  if (!userId) {
    return responseHandler.sendError(reply, 401, "Unauthorized");
  }

  const location = await getUserLocation(userId);
  if (!location) {
    return responseHandler.sendError(
      reply,
      400,
      "Location required. Please update your location first.",
    );
  }

  request.userLocation = location;
}
