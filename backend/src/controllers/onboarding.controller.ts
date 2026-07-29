import { prisma } from "@/lib/prisma";
import type { FastifyRequest, FastifyReply } from "fastify";
import { responseHandler } from "@/utils/apiResponse";
import { username } from "better-auth/plugins";
import { z } from "zod";

export async function checkOnboarding(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user.id;

  if (!userId) {
    return responseHandler.sendError(reply, 401, "Unauthorized");
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      username: true,
      image: true,
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
    image: dbUser.image,
  };

  return responseHandler.sendSuccess(reply, 200, "onboarding check response", data);
}

const onboardingSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required!!")
    .max(20, "Username should not be greater than 20 letters!!"),
  image: z.string().optional()
});

export async function setOnboardingStatus(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user.id;

  if (!userId) {
    return responseHandler.sendError(reply, 401, "Unauthorized");
  }

  const body = await request.body;

  const parsed = onboardingSchema.safeParse(body);

  if (!parsed.success) {
    return responseHandler.sendError(reply, 400, "Invalid input", parsed.error)
  }

  const { username, image } = parsed.data;
}
