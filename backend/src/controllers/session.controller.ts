import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@/lib/prisma";
import { responseHandler } from "@/utils/apiResponse";

export async function getActiveSessions(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user?.id;
  const currentSessionToken = request.session?.token;

  if (!userId) {
    return responseHandler.sendError(reply, 401, "Unauthorized");
  }

  const sessions = await prisma.session.findMany({
    where: { userId },
    select: {
      id: true,
      userAgent: true,
      ipAddress: true,
      createdAt: true,
      expiresAt: true,
      token: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedSessions = sessions.map((session) => ({
    id: session.id,
    userAgent: session.userAgent,
    ipAddress: session.ipAddress,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    isCurrent: session.token === currentSessionToken,
  }));

  return responseHandler.sendSuccess(
    reply,
    200,
    "Sessions retrieved",
    { sessions: formattedSessions },
  );
}

export async function revokeSession(
  request: FastifyRequest<{
    Params: { sessionId: string };
  }>,
  reply: FastifyReply,
) {
  const userId = request.user?.id;
  const currentSessionToken = request.session?.token;

  if (!userId) {
    return responseHandler.sendError(reply, 401, "Unauthorized");
  }

  const { sessionId } = request.params;

  if (!sessionId) {
    return responseHandler.sendError(reply, 400, "Session ID is required");
  }

  // Find the session to ensure it belongs to the user
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { userId: true, token: true },
  });

  if (!session) {
    return responseHandler.sendError(reply, 404, "Session not found");
  }

  if (session.userId !== userId) {
    return responseHandler.sendError(reply, 403, "Cannot revoke another user's session");
  }

  if (session.token === currentSessionToken) {
    return responseHandler.sendError(reply, 400, "Cannot revoke your current session. Use sign out instead.");
  }

  await prisma.session.delete({
    where: { id: sessionId },
  });

  return responseHandler.sendSuccess(reply, 200, "Session revoked successfully");
}
