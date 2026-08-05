import { prisma } from "@/lib/prisma";
import {
  createGroupSchema,
  groupLinkSchema,
  groupMessagesQuerySchema,
} from "@/types/group.type";
import type { FastifyRequest, FastifyReply } from "fastify";
import { responseHandler } from "@/utils/apiResponse";
import { getDistanceInKm } from "@/utils/calculateDistance";
import { MESSAGES_PER_PAGE } from "@/constants/group";
import { getUserLocation } from "@/helper/locationHelper";
import { getGroupMembership } from "@/helper/groupHelper";
import { deleteCachedData, cacheKeys } from "@/lib/redis/cache";

export async function createGroup(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.user?.id;

    if (!userId) {
      return responseHandler.sendError(reply, 401, "Unauthorized");
    }

    const body = request?.body;

    const validationResult = createGroupSchema.safeParse(body);

    if (!validationResult.success) {
      return responseHandler.sendValidationError(
        reply,
        validationResult.error,
        "Validation error",
      );
    }

    const { name, description, maxMembers, expiryDate, latitude, longitude } =
      validationResult.data;

    const group = await prisma.group.create({
      data: {
        name,
        description,
        maxMembers,
        expiresAt: expiryDate ? new Date(expiryDate) : null,
        latitude,
        longitude,
        createdAt: new Date(),
        groupMembers: {
          create: {
            userId: userId,
          },
        },
      },
    });

    return responseHandler.sendSuccess(
      reply,
      200,
      "Group created successfully!!",
      {
        groupId: group.id,
        name: group.name,
      },
    );
  } catch (error: unknown) {
    console.error(`Error in POST /api/group/create: ${error}`);
    return responseHandler.sendError(
      reply,
      500,
      "Error occured while creating the group",
      error,
    );
  }
}

export async function getGroupMembers(
  request: FastifyRequest<{
    Params: {
      groupId: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const userId = request.user?.id;

    if (!userId) {
      return responseHandler.sendError(reply, 401, "Unauthorized");
    }

    const body = request.params;

    const validation = groupLinkSchema.safeParse(body);

    if (!validation.success) {
      return responseHandler.sendValidationError(
        reply,
        validation.error,
        "Invalid request body",
      );
    }

    const { groupId } = validation.data;

    if (!groupId) {
      return responseHandler.sendError(reply, 400, "GroupId is required");
    }

    const membership = await getGroupMembership(userId, groupId);

    if (membership) {
      const group = await prisma.group.findUnique({
        where: {
          id: groupId,
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          groupMembers: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarStyle: true,
                  avatarSeed: true,
                  avatarBackgroundColor: true,
                  avatarVersion: true,
                },
              },
            },
          },
        },
      });

      if (!group) {
        return responseHandler.sendError(reply, 404, "Group not found");
      }

      return responseHandler.sendSuccess(
        reply,
        200,
        group.groupMembers.length > 0
          ? "Group members retrieved successfully"
          : "No members yet",
        group.groupMembers,
      );
    } else {
      return responseHandler.sendError(
        reply,
        403,
        "User is not a member of the group",
      );
    }
  } catch (error: unknown) {
    console.error(error);

    return responseHandler.sendError(
      reply,
      500,
      "Failed to retrieve group members",
      error,
    );
  }
}

export async function findGroup(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.authUser?.id ?? request.user?.id;

    if (!userId) {
      return responseHandler.sendError(reply, 401, "Unauthorized");
    }

    // Retrieve user location from Redis cache (or DB on cache miss)
    const userLocation = request.userLocation ?? (await getUserLocation(userId));

    if (!userLocation) {
      return responseHandler.sendError(
        reply,
        400,
        "User location is required. Please set your location to find nearby groups.",
      );
    }

    const groups = await prisma.group.findMany({
      where: {
        groupMembers: {
          none: {
            userId,
          },
        },
      },
      include: {
        _count: {
          select: {
            groupMembers: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const MAX_RADIUS_KM = userLocation.selectedDistance;

    const nearbyGroups = groups.filter((group) => {
      if (!group.latitude || !group.longitude) {
        return false;
      }

      const distance = getDistanceInKm(
        userLocation.latitude,
        userLocation.longitude,
        group.latitude,
        group.longitude,
      );

      return distance <= MAX_RADIUS_KM;
    });

    const formattedGroups = nearbyGroups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      maxMembers: group.maxMembers,
      memberCount: group._count.groupMembers,
      expiryDate: group.expiresAt,
      createdAt: group.createdAt,
    }));

    return responseHandler.sendSuccess(
      reply,
      200,
      "Groups found",
      formattedGroups,
    );
  } catch (error: unknown) {
    console.error(`Error in GET /api/group/all: ${error}`);
    return responseHandler.sendError(
      reply,
      500,
      "Internal server error while fetching groups!!",
    );
  }
}

export async function getJoinedGroups(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.user?.id;

    if (!userId) {
      return responseHandler.sendError(reply, 401, "Unauthorized");
    }

    const userGroups = await prisma.groupMember.findMany({
      where: {
        userId,
      },
      include: {
        group: {
          include: {
            _count: {
              select: {
                groupMembers: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    if (!userGroups) {
      return responseHandler.sendError(reply, 404, "No groups found");
    }

    const formattedGroups = userGroups.map((membership) => ({
      id: membership.group.id,
      name: membership.group.name,
      description: membership.group.description,
      memberCount: membership.group._count.groupMembers,
      maxMembers: membership.group.maxMembers,
      expiryDate: membership.group.expiresAt?.toISOString() || null,
      createdAt: membership.group.createdAt.toISOString(),
    }));

    return responseHandler.sendSuccess(
      reply,
      200,
      "Groups retrieved successfully",
      formattedGroups,
    );
  } catch (error: unknown) {
    console.error(`Error in GET /api/group/joined: ${error}`);
    return responseHandler.sendError(
      reply,
      500,
      "Internal server error while fetching joined groups",
    );
  }
}

export async function joiningGroup(
  request: FastifyRequest<{
    Params: {
      groupId: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const userId = request.user?.id;

    if (!userId) {
      return responseHandler.sendError(reply, 401, "Unauthorized");
    }

    const body = request.params;

    const validation = groupLinkSchema.safeParse(body);

    if (!validation.success) {
      return responseHandler.sendValidationError(
        reply,
        validation.error,
        "Invalid request body",
      );
    }

    const { groupId } = validation.data;

    if (!groupId) {
      return responseHandler.sendError(reply, 400, "Group ID is required");
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        _count: {
          select: {
            groupMembers: true,
          },
        },
      },
    });

    if (!group) {
      return responseHandler.sendError(reply, 404, "Group not found");
    }

    const groupMembership = await getGroupMembership(userId, groupId);

    if (groupMembership) {
      return responseHandler.sendError(
        reply,
        400,
        "User is already a member of this group",
      );
    }

    if (group.maxMembers && group._count.groupMembers >= group.maxMembers) {
      return responseHandler.sendError(reply, 400, "Group is full");
    }

    // Check if group has expired
    if (group.expiresAt && new Date(group.expiresAt) < new Date()) {
      return responseHandler.sendError(reply, 400, "Group has expired");
    }

    await prisma.groupMember.create({
      data: {
        userId,
        groupId,
      },
    });

    await deleteCachedData(cacheKeys.groupMembership(userId, groupId));

    return responseHandler.sendSuccess(reply, 200, "Joined group successfully");
  } catch (error: unknown) {
    console.error(`Error in POST /api/group/join: ${error}`);
    return responseHandler.sendError(
      reply,
      500,
      "Internal server error while joining the group",
    );
  }
}

export async function leaveGroup(
  request: FastifyRequest<{
    Params: {
      groupId: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const userId = request.user?.id;

    if (!userId) {
      return responseHandler.sendError(reply, 401, "Unauthorized");
    }

    const body = request.params;

    const validation = groupLinkSchema.safeParse(body);

    if (!validation.success) {
      return responseHandler.sendValidationError(
        reply,
        validation.error,
        "Invalid request body",
      );
    }

    const { groupId } = validation.data;

    const groupMembership = await getGroupMembership(userId, groupId);

    if (!groupMembership) {
      return responseHandler.sendError(
        reply,
        404,
        "User is not a member of this group",
      );
    }

    await prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    await deleteCachedData(cacheKeys.groupMembership(userId, groupId));

    return responseHandler.sendSuccess(reply, 200, "Left group successfully");
  } catch (error: unknown) {
    console.error(`Error leaving group: ${error}`);
    return responseHandler.sendError(
      reply,
      500,
      "Internal server error while leaving the group",
    );
  }
}

export async function groupChat(
  request: FastifyRequest<{
    Params: {
      groupId: string;
    };
    Querystring: {
      cursor?: string;
      limit?: number;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const userId = request.user?.id;

    if (!userId) {
      return responseHandler.sendError(reply, 401, "Unauthorized");
    }

    const validation = groupLinkSchema.safeParse(request.params);

    if (!validation.success) {
      return responseHandler.sendValidationError(
        reply,
        validation.error,
        "Invalid group id",
      );
    }

    const queryValidation = groupMessagesQuerySchema.safeParse(request.query);

    if (!queryValidation.success) {
      return responseHandler.sendValidationError(
        reply,
        queryValidation.error,
        "Invalid query parameters",
      );
    }

    const { groupId } = validation.data;
    const { cursor, limit = MESSAGES_PER_PAGE } = queryValidation.data;

    const groupMembership = await getGroupMembership(userId, groupId);

    if (!groupMembership) {
      return responseHandler.sendError(
        reply,
        403,
        "You are not a member of this group",
      );
    }

    // Fetch one extra message to determine if more messages exist
    const messages = await prisma.groupMessage.findMany({
      where: {
        groupId,
      },
      ...(cursor && {
        cursor: {
          id: cursor,
        },
        skip: 1,
      }),
      orderBy: [
        {
          createdAt: "desc",
        },
        {
          id: "desc",
        },
      ],
      take: limit + 1,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarBackgroundColor: true,
            avatarSeed: true,
            avatarVersion: true,
            avatarStyle: true,
          },
        },
      },
    });

    const hasMore = messages.length > limit;

    if (hasMore) {
      // remove that extra record
      messages.pop();
    }

    const lastMessage = messages.at(-1);

    const formattedMessages = messages
    .map((message) => ({
        id: message.id,
        groupId: message.groupId,
        userId: message.user.id,
        username: message.user.username,
        content: message.content,
        mediaUrl: message.mediaUrl,
        mediaType: message.mediaType,
        avatarStyle: message.user.avatarStyle,
        avatarSeed: message.user.avatarSeed,
        avatarBackgroundColor: message.user.avatarBackgroundColor,
        avatarVersion: message.user.avatarVersion,
        createdAt: message.createdAt.toISOString(),
      }))
      .reverse();

    return responseHandler.sendSuccess(reply, 200, "Messages Fetched", {
      messages: formattedMessages,
      hasMore,
      nextCursor: hasMore && lastMessage ? lastMessage.id : null,
    });
  } catch (error: unknown) {
    console.error(error);
    return responseHandler.sendError(reply, 500, "Internal server error");
  }
}
