import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@/lib/prisma";
import { responseHandler } from "@/utils/apiResponse";
import { otherUserSchema } from "@/types/user.type";

function publicUser(user: {
  id: string;
  email: string;
  emailVerified: boolean;
  username: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    username: user.username,
  };
}

export async function getMe(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user?.id;

  if (!userId) {
    return responseHandler.sendError(reply, 401, "Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      username: true,
    },
  });

  if (!user) {
    return responseHandler.sendError(reply, 404, "User not found");
  }

  return responseHandler.sendSuccess(reply, 200, "User found", {
    user: publicUser(user),
  });
}

export async function completeOnboarding(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user?.id;

  if (!userId) {
    return responseHandler.sendError(reply, 401, "Unauthorized");
  }

  const body = request.body as { username?: unknown; image?: unknown };
  const username =
    typeof body.username === "string" ? body.username.trim() : "";
  const image = typeof body.image === "string" ? body.image.trim() : "";

  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    return responseHandler.sendError(
      reply,
      400,
      "Username must be 3-30 characters and contain only letters, numbers, or underscores",
    );
  }

  if (!image) {
    return responseHandler.sendError(reply, 400, "Profile picture is required");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  });

  if (!currentUser?.emailVerified) {
    return responseHandler.sendError(
      reply,
      403,
      "Verify your email before onboarding",
    );
  }

  const usernameExists = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (usernameExists && usernameExists.id !== userId) {
    return responseHandler.sendError(reply, 409, "Username is already taken");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      username,
    },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      username: true,
    },
  });

  return responseHandler.sendSuccess(reply, 200, "User updated successfully", {
    user: publicUser(user),
  });
}

export async function getUserProfile(
  request: FastifyRequest<{
    Params: {
      username: string
    }
  }>,
  reply: FastifyReply,
) {
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
      username
    },
    select: {
      id: true,
      username: true,
      email: true,
      emailVerified: true,
      avatarStyle: true,
      avatarSeed: true,
      avatarBackgroundColor: true,
      avatarVersion: true,
      location: true,
      lastLocation: true,
      selectedDistance: true,
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

  const returnedUser = user;

  if (false === returnedUser.emailVerified) {
    return responseHandler.sendSuccess(
      reply,
      200,
      "Please verify your email before onboarding",
      user,
    );
  }

  return responseHandler.sendSuccess(
    reply,
    200,
    "User profile retrieved successfully",
    user,
  );
}

export async function getOtherUserProfile(
  request: FastifyRequest<{
    Params: {
      username: string
    }
  }>,
  reply: FastifyReply,
) {
  try {
    const currentUserId = request.user?.id;

    if (!currentUserId) {
      return responseHandler.sendError(reply, 401, "Unauthorized");
    }

    const body = request.params;

    const validation = otherUserSchema.safeParse(body);

    if (!validation.success) {
      return responseHandler.sendError(
        reply,
        400,
        "Invalid request body",
        validation.error,
      );
    }

    const { username } = validation.data;

    const otherUser = await prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
        avatarBackgroundColor: true,
        avatarSeed: true,
        avatarStyle: true,
        avatarVersion: true
      },
    });

    if (!otherUser) {
      return responseHandler.sendError(reply, 404, "User not found");
    }

    const commonGroups = await prisma.group.findMany({
      where: {
        AND: [
          {
            groupMembers: {
              some: {
                userId: currentUserId
              },
            },
          },
          {
            groupMembers: {
              some: {
                user: {
                  username: username
                },
              },
            },
          },
        ],
      },
    });

    const formattedResult = commonGroups.map((group) => {
      (group.name, group.description, group.maxMembers, group.createdAt);
    });

    const returnedUser = {
      ...otherUser,
      commonGroups: formattedResult,
    };

    return responseHandler.sendSuccess(
      reply,
      200,
      "Groups fetched successfully",
      returnedUser,
    );
  } catch (error: unknown) {
    console.error("Error at [getOtherUserProfile], ", error);
    return responseHandler.sendError(
      reply,
      500,
      "Internal Server Error while fetching the groups",
      error,
    );
  }
}

