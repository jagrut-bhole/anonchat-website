import type { FastifyInstance } from "fastify";
import { authenticate } from "@/middlewares/auth.middleware";
import { checkOnboarding, setOnboardingStatus } from "@/controllers/onboarding.controller";
import { generateSeeds } from "@/controllers/avatar.controller";

export async function onboardingRoute(app: FastifyInstance) {
  app.get(
    "/check",
    {
      preHandler: authenticate,
    },
    checkOnboarding,
  );

  app.post(
    "/complete",
    {
      preHandler: authenticate,
    },
    setOnboardingStatus,
  );

  app.post(
    "/generate-seeds",
    {
      preHandler: authenticate,
    },
    generateSeeds,
  );
}