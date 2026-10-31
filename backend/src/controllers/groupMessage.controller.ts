import { prisma } from "@/lib/prisma";
import type { FastifyRequest, FastifyReply } from "fastify";
import {
  cacheKeys,
} from "@/lib/redis/cache";
import { responseHandler } from "@/utils/apiResponse";
import { getGroupMembership } from "@/helper/groupHelper";
import {
  EDIT_WINDOW_MS,
  GROUP_MESSAGE_DELETE_TYPE,
  DELETE_WINDOW_MS,
} from "@/constants/group";
import { publishGroupEvent } from "@/shared/realtime";
import { redis } from "@/lib/redis/redis";

export async function editMessage(
  request: FastifyRequest<{
    Params: {
      groupId: string;
    };
    Body: {
      messageId: string;
      content: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const userId = request.user?.id;

    if (!userId) {
      return responseHandler.sendError(reply, 401, "Unauthorized");
    }

    const { groupId } = request.params;
    const { content, messageId } = request.body;

    const groupMembership = await getGroupMembership(userId, groupId);

    if (!groupMembership) {
      return responseHandler.sendError(
        reply,
        404,
        "User is not a member of this group",
      );
    }

    const message = await prisma.groupMessage.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message || message.deletedForEveryone) {
      return responseHandler.sendError(reply, 404, "Message not found");
    }

    if (message.userId !== userId) {
      return responseHandler.sendError(
        reply,
        403,
        "You are not the author of this message",
      );
    }

    if (Date.now() - message.createdAt.getTime() > EDIT_WINDOW_MS) {
      return responseHandler.sendError(reply, 403, "Edit window has expired");
    }

    const updated = await prisma.groupMessage.update({
      where: {
        id: messageId,
      },
      data: {
        content,
        editedAt: new Date(),
      },
    });

    await publishGroupEvent(message.groupId, {
      type: "message:edited",
      messageId,
      content: updated.content,
      editedAt: updated.editedAt,
    });

    return responseHandler.sendSuccess(reply, 200, "Message edited", updated);
  } catch (error: unknown) {
    console.error(error);
    return responseHandler.sendError(reply, 500, "Internal server error");
  }
}

export async function deleteGroupMessage(
  request: FastifyRequest<{
    Params: {
      groupId: string;
    };
    Body: {
      messageId: string;
      mode: (typeof GROUP_MESSAGE_DELETE_TYPE)[keyof typeof GROUP_MESSAGE_DELETE_TYPE];
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const userId = request.user?.id;

    if (!userId) {
      return responseHandler.sendError(reply, 401, "Unauthorized");
    }

    const { messageId, mode } = request.body;

    const { groupId } = request.params;

    const groupMembership = await getGroupMembership(userId, groupId);

    if (!groupMembership) {
      return responseHandler.sendError(
        reply,
        403,
        "You are not a member of this group",
      );
    }

    const message = await prisma.groupMessage.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      return responseHandler.sendError(reply, 404, "Message not found");
    }

    if (mode === GROUP_MESSAGE_DELETE_TYPE.ME) {
      await prisma.messageDeletion.upsert({
        where: {
          messageId_userId: {
            messageId,
            userId,
          },
        },
        create: {
          messageId,
          userId,
        },
        update: {},
      });

      return responseHandler.sendSuccess(
        reply,
        200,
        "Message deleted for you",
        null,
      );
    }

    if (message.userId !== userId) {
      return responseHandler.sendError(
        reply,
        403,
        "You can only delete your own messages for everyone",
      );
    }

    if (Date.now() - message.createdAt.getTime() > DELETE_WINDOW_MS) {
      return responseHandler.sendError(
        reply,
        403,
        "Message deletion is not allowed after 20 minutes",
      );
    }

    const updated = await prisma.groupMessage.update({
      where: {
        id: messageId,
      },
      data: {
        deletedForEveryone: true,
        content: null,
        mediaUrl: null,
        mediaType: null,
      },
    });

    await publishGroupEvent(message.groupId, {
      type: "message:deleted",
      messageId,
    });

    return responseHandler.sendSuccess(
      reply,
      200,
      "Message deleted for everyone",
      updated,
    );
  } catch (error: unknown) {
    console.error(error);
    return responseHandler.sendError(reply, 500, "Internal server error");
  }
}

// groupReactions
export async function addReaction(
  request: FastifyRequest<{
    Params: {
      groupId: string;
    };
    Body: {
      messageId: string;
      emoji: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const userId = request.user?.id;

    if (!userId) {
      return responseHandler.sendError(reply, 401, "Unauthorized");
    }

    const { groupId } = request.params;
    const { messageId, emoji } = request.body;

    const groupMembership = await getGroupMembership(userId, groupId);

    if (!groupMembership) {
      return responseHandler.sendError(
        reply,
        403,
        "You are not a member of this group",
      );
    }

    const message = await prisma.groupMessage.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message || message.deletedForEveryone) {
      return responseHandler.sendError(reply, 404, "Message not found");
    }

    const reaction = await prisma.messageReaction.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
      create: {
        messageId,
        userId,
        emoji,
      },
      update: {
        emoji,
      },
    });

    await publishGroupEvent(message.groupId, {
      type: "reaction:added",
      messageId,
      userId,
      emoji,
    });

    return responseHandler.sendSuccess(reply, 200, "Reaction added", reaction);
  } catch (error) {
    console.error(error);
    return responseHandler.sendError(reply, 500, "Internal server error");
  }
}

export async function removeReaction(
  request: FastifyRequest<{
    Params: {
      groupId: string;
    };
    Body: {
      messageId: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const userId = request.user?.id;

    if (!userId) {
      return responseHandler.sendError(reply, 401, "Unauthorized");
    }

    const { groupId } = request.params;
    const { messageId } = request.body;

    const groupMembership = await getGroupMembership(userId, groupId);

    if (!groupMembership) {
      return responseHandler.sendError(
        reply,
        403,
        "You are not a member of this group",
      );
    }

    const existingReaction = await prisma.messageReaction.findUnique({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
    });

    if (!existingReaction) {
      return responseHandler.sendSuccess(reply, 200, "Reaction not found");
    }

    await prisma.messageDeletion.delete({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
    });

    const message = await prisma.groupMessage.findUnique({
      where: {
        id: messageId,
      },
      select: {
        groupId: true,
      },
    });

    if (message) {
      await publishGroupEvent(message.groupId, {
        type: "reactionRemoved",
        messageId,
        userId,
      });
    }

    return responseHandler.sendSuccess(reply, 200, "Reaction removed", null);
  } catch (error: unknown) {
    console.error(error);
    return responseHandler.sendError(reply, 500, "Internal server error");
  }
}

export async function searchGroupMessages(
  request: FastifyRequest<{
    Params: {
      groupId: string;
    };
    Querystring: {
      q: string;
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

    const { groupId } = request.params;
    const { q, limit } = request.query;

    if (!q || q.trim().length < 2) {
      return responseHandler.sendError(reply, 400, "Search query too short");
    }

    const membership = await getGroupMembership(userId, groupId);

    if (!membership)
      return responseHandler.sendError(reply, 403, "Not a member");

    const rlKey = cacheKeys.rateLimit(userId, "message-search");
    const count = await redis.incr(rlKey);
    if (count === 1) await redis.expire(rlKey, 60);
    if (count > 20)
      return responseHandler.sendError(
        reply,
        429,
        "Too many searches, slow down",
      );

    const results = await prisma.$queryRaw`
          SELECT id, "userId", content, "createdAt"
          FROM group_messages
          WHERE "groupId" = ${groupId}
            AND "deletedForEveryone" = false
            AND content % ${q}
          ORDER BY similarity(content, ${q}) DESC, "createdAt" DESC
          LIMIT ${limit}
        `;

    return responseHandler.sendSuccess(reply, 200, "Search results", results);
  } catch (error) {
    console.error(error);
    return responseHandler.sendError(reply, 500, "Internal server error");
  }
}
