import { prisma } from "@/lib/prisma";
import type { FastifyRequest, FastifyReply } from "fastify";
import { responseHandler } from "@/utils/apiResponse";
import { onboardingSchema } from "@/types/onboarding.type";
import { buildAvatarUrl, DICEBEAR_VERSION } from "@/constants/avatar";
import { geoLocation, formatLocation } from "@/lib/getGeoLocation";


export async function checkOnboarding(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user?.id;

  if (!userId) {
    return responseHandler.sendError(reply, 401, "Unauthorized");
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      username: true,
      avatarSeed: true,
      avatarStyle: true,
      avatarBackgroundColor: true,
      accounts: {
        select: {
          onboardingCompleted: true,
        },
      },
    },
  });

  if (!dbUser) {
    return responseHandler.sendError(reply, 404, "User not found");
  }

  const onboardedAccount = await prisma.account.findFirst({
    where: {
      userId,
      onboardingCompleted: true,
    },
    select: {
      id: true,
    },
  });

  const data = {
    onboardingCompleted: !!onboardedAccount,
    username: dbUser.username,
    avatarStyle: dbUser.avatarStyle,
    avatarSeed: dbUser.avatarSeed,
    avatarBackgroundColor: dbUser.avatarBackgroundColor,
  };

  return responseHandler.sendSuccess(reply, 200, "Onboarding check response", data);
}

export async function setOnboardingStatus(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user?.id;

  if (!userId) {
    return responseHandler.sendError(reply, 401, "Unauthorized");
  }

  const parsed = onboardingSchema.safeParse(request.body);

  if (!parsed.success) {
    return responseHandler.sendError(reply, 400, "Invalid input", parsed.error);
  }

  const { username, avatarStyle, avatarSeed, avatarBackgroundColor, selectedDistance, latitude, longitude } = parsed.data;

  // Verify email is verified before allowing onboarding
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  });

  if (!currentUser?.emailVerified) {
    return responseHandler.sendError(
      reply,
      403,
      "Verify your email before completing onboarding",
    );
  }

  // Check username uniqueness (case-insensitive since we store lowercase)
  const usernameExists = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (usernameExists && usernameExists.id !== userId) {
    return responseHandler.sendError(reply, 409, "Username is already taken");
  }

  // Perform all updates in a transaction
  // Reverse-geocode location if coordinates are provided
  let formattedLocation: string | undefined;
  if (latitude !== undefined && longitude !== undefined) {
    try {
      const geoResult = await geoLocation({ latitude, longitude });
      formattedLocation = formatLocation(geoResult);
    } catch (error) {
      console.error("Geocoding error during onboarding:", error);
    }
  }

  // Perform all updates in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update user with avatar, username, distance, and optional location
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        username,
        avatarStyle,
        avatarSeed,
        avatarBackgroundColor,
        avatarVersion: DICEBEAR_VERSION,
        selectedDistance,
        ...(latitude !== undefined && longitude !== undefined
          ? {
              latitude,
              longitude,
              lastLocation: new Date(),
              location: formattedLocation ?? "Unknown Location",
            }
          : {}),
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        username: true,
        avatarStyle: true,
        avatarSeed: true,
        avatarBackgroundColor: true,
        avatarVersion: true,
      },
    });

    // Mark all credential accounts as onboarded
    await tx.account.updateMany({
      where: { userId },
      data: { onboardingCompleted: true },
    });

    // Create avatar history entry
    await tx.avatarHistory.create({
      data: {
        userId,
        style: avatarStyle,
        seed: avatarSeed,
        backgroundColor: avatarBackgroundColor,
        version: DICEBEAR_VERSION,
      },
    });

    return updatedUser;
  });

  const avatarUrl = buildAvatarUrl(result.avatarStyle!, result.avatarSeed!, result.avatarBackgroundColor!);

  return responseHandler.sendSuccess(reply, 200, "Onboarding completed", {
    user: {
      ...result,
      image: avatarUrl,
    },
    onboardingCompleted: true,
  });
}
