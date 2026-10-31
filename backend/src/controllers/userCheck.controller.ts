import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@/lib/prisma";
import { usernameValidation } from "@/types/user.type";
import { responseHandler } from "@/utils/apiResponse";
import { validateData } from "@/utils/validate";

export async function checkUsername(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {

    const data = validateData(usernameValidation, request.body, reply);

    if (!data) return;

    // Always convert to lowercase for case-insensitive comparison
    const username = data.toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        username,
        emailVerified: true,
      },
    });

    if (user) {
      return responseHandler.sendError(reply, 400, "Username is already taken");
    }

    return responseHandler.sendSuccess(reply, 200, "Username is available");
  } catch (error) {
    console.error("Server error while checking username:", error);
    return responseHandler.sendError(reply, 500, "Server error");
  }
}
