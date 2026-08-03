import type { FastifyInstance } from "fastify";
import {
  completeOnboarding,
  getMe,
  getUserProfile,
  getOtherUserProfile,
} from "@/controllers/user.controller";
import { getActiveSessions, revokeSession } from "@/controllers/session.controller";
import { authenticate } from "@/middlewares/auth.middleware";

export async function userRoutes(app: FastifyInstance) {
  app.get(
    "/me",
    {
      preHandler: authenticate,
    },
    getMe,
  );

  app.post(
    "/onboarding",
    {
      preHandler: authenticate,
    },
    completeOnboarding,
  );

  app.get(
    "/profile",
    {
      preHandler: authenticate,
    },
    getUserProfile,
  );

  app.get<{
    Params: {
      userId: string;
    };
  }>(
    "/profile/:userId",
    {
      preHandler: authenticate,
    },
    getOtherUserProfile,
  );

  // Session management routes
  app.get(
    "/sessions",
    {
      preHandler: authenticate,
    },
    getActiveSessions,
  );

  app.delete<{
    Params: {
      sessionId: string;
    };
  }>(
    "/sessions/:sessionId",
    {
      preHandler: authenticate,
    },
    revokeSession,
  );
}
