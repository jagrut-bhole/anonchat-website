import type { FastifyInstance } from "fastify";
import {
  completeOnboarding,
  getMe,
  getUserProfile,
  getOtherUserProfile,
} from "@/controllers/user.controller";
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
}
