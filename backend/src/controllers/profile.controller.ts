import { prisma } from "@/lib/prisma";
import type { FastifyRequest, FastifyReply } from "fastify";
import { responseHandler } from "@/utils/apiResponse";
import { locationSchema } from "@/types/location.type";
import { geoLocation, formatLocation } from "@/lib/getGeoLocation";
import {
  isLocationUpdatedRecently,
  setUserLocationCache,
} from "@/helper/locationHelper";
import { invalidateAuthUserCache } from "@/helper/authHelper";

export async function getUserProfile(
  request: FastifyRequest<{
    Params: {
      username: string;
      userId: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const userId = request.user?.id;

    if (!userId) {
      return responseHandler.sendError(reply, 401, "Unauthorized");
    }

    const username: string = request.params.username;

    if (!username) {
      return responseHandler.sendError(reply, 400, "Username is required");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        username,
      },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
        avatarSeed: true,
        avatarBackgroundColor: true,
        avatarStyle: true,
        avatarVersion: true,
        location: true,
        lastLocation: true,
        createdAt: true,
        accounts: {
          select: {
            onboardingCompleted: true,
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return responseHandler.sendError(reply, 404, "User not found");
    }

    if (false === user.emailVerified) {
      return responseHandler.sendError(reply, 403, "Email not verified");
    }

    return responseHandler.sendSuccess(
      reply,
      200,
      "User profile retrieved successfully",
      user,
    );
  } catch (error: unknown) {
    console.error("Error at getUserProfile function [profile.controller]", error);
    return responseHandler.sendError(reply, 500, "Internal server error");
  }
}

export async function updateUserLocation(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.authUser?.id ?? request.user?.id;

    if (!userId) {
      return responseHandler.sendError(reply, 401, "Unauthorized");
    }

    // 1. Check if user updated location within 24 hours
    const { isRecent, hoursRemaining } = await isLocationUpdatedRecently(userId);

    if (isRecent) {
      return responseHandler.sendError(
        reply,
        429,
        `You can only update your location once per day. Please try again in ${hoursRemaining} hour${hoursRemaining > 1 ? "s" : ""}.`,
      );
    }

    // 2. Validate location payload
    const validationResult = locationSchema.safeParse(request.body);

    if (!validationResult.success) {
      return responseHandler.sendValidationError(
        reply,
        validationResult.error,
        "Invalid location data",
      );
    }

    const { latitude, longitude } = validationResult.data;

    // 3. Geocode location string
    let formattedLocation = "Unknown Location";
    try {
      const geoCodeResult = await geoLocation({ latitude, longitude });
      formattedLocation = formatLocation(geoCodeResult);
    } catch (error: unknown) {
      console.error("Geocoding error in updateUserLocation:", error);
    }

    // 4. Update Database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        latitude,
        longitude,
        location: formattedLocation,
        lastLocation: new Date(),
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        location: true,
        lastLocation: true,
        selectedDistance: true,
      },
    });

    // 5. Update Redis caches
    await setUserLocationCache(userId, {
      latitude: updatedUser.latitude!,
      longitude: updatedUser.longitude!,
      selectedDistance: updatedUser.selectedDistance ?? 25,
      lastLocation: updatedUser.lastLocation,
    });

    await invalidateAuthUserCache(userId);

    return responseHandler.sendSuccess(
      reply,
      200,
      "Location updated successfully",
      {
        location: updatedUser.location,
        latitude: updatedUser.latitude,
        longitude: updatedUser.longitude,
        lastLocation: updatedUser.lastLocation,
      },
    );
  } catch (error: unknown) {
    console.error("Error at updateUserLocation function [profile.controller]", error);
    return responseHandler.sendError(reply, 500, "Internal server error");
  }
}