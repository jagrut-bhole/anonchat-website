import { prisma } from "@/lib/prisma";
import type { FastifyRequest, FastifyReply } from "fastify";
import { geoLocation, formatLocation } from "@/lib/getGeoLocation";
import { locationSchema } from "@/types/location.type";
import { cacheKeys, setCachedData } from "@/lib/redis/cache";
import { responseHandler } from "@/utils/apiResponse";

export async function locationUpdate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.user.id;

    if (!userId) {
      return responseHandler.sendError(reply, 401, "Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        username: true,
        lastLocation: true,
        latitude: true,
        longitude: true,
        createdAt: true,
      },
    });

    if (!user) {
      return responseHandler.sendError(reply, 404, "User not Found");
    }

    const body = request.body;

    const validationResult = locationSchema.safeParse(body);

    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      return responseHandler.sendError(
        reply,
        400,
        "Invalid location data",
        formattedErrors,
      );
    }

    const { latitude, longitude } = validationResult.data;

    if (user?.lastLocation) {
      const lastUpdateTime = new Date(user.lastLocation).getTime();
      const currentTime = new Date().getTime();
      const hoursSinceLastUpdate =
        (currentTime - lastUpdateTime) / (1000 * 60 * 60);

      if (hoursSinceLastUpdate < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSinceLastUpdate);

        return responseHandler.sendError(
          reply,
          429,
          `You can only update your location once per day. Please try again in ${hoursRemaining} hour${hoursRemaining > 1 ? "s" : ""}.`,
        );
      }

      let formattedLocation = "Unknown Location";

      try {
        const geoCodeResult = await geoLocation({
          latitude,
          longitude,
        });
        formattedLocation = formatLocation(geoCodeResult);
      } catch (error: unknown) {
        console.error("Geocoding error:", error);
      }
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          lastLocation: new Date(),
          latitude,
          longitude,
          location: formattedLocation,
        },
      });

      await setCachedData(
        cacheKeys.user(user.id),
        {
          ...user,
          lastLocation: new Date(),
          latitude,
          longitude,
          location: formattedLocation,
        },
        60 * 10,
      );

      return responseHandler.sendSuccess(
        reply,
        200,
        "Location updated successfully",
      );
    }
  } catch (error: unknown) {
    console.error(`Error in POST /api/auth/location: ${error}`);
    return responseHandler.sendError(
      reply,
      500,
      "Server error occured while setting the users location",
      error,
    );
  }
}
