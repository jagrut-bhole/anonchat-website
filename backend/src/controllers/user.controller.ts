import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@/lib/prisma";
import { responseHandler } from "@/utils/apiResponse";
import { otherUser } from "@/types/user.type";

function publicUser(user: {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  username: string | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
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
      name: true,
      email: true,
      emailVerified: true,
      image: true,
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
      image,
    },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      username: true,
    },
  });

  return responseHandler.sendSuccess(reply, 200, "User updated successfully", {
    user: publicUser(user),
  });
}

export async function getUserProfile(
  request: FastifyRequest,
  reply: FastifyReply,
) {
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
      username: true,
      email: true,
      emailVerified: true,
      image: true,
      location: true,
      lastLocation: true,
      selectedDistance: true,
      createdAt: true,
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
      userId: string
    }
  }>,
  reply: FastifyReply,
) {
  try {
    const currentUserId = request.user.id;

    if (!currentUserId) {
      return responseHandler.sendError(reply, 401, "Unauthorized");
    }

    const body = request.params;

    const validation = otherUser.safeParse(body);

    if (!validation.success) {
      return responseHandler.sendError(
        reply,
        400,
        "Invalid request body",
        validation.error,
      );
    }

    const { userId } = validation.data;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return responseHandler.sendError(reply, 404, "User not found");
    }

    const commonGroups = await prisma.group.findMany({
      where: {
        AND: [
          {
            groupMembers: {
              some: {
                userId: currentUserId,
              },
            },
          },
          {
            groupMembers: {
              some: {
                userId: userId,
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
      ...user,
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

