import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@/lib/prisma";
import { usernameValidation } from "@/types/user.type";
import { responseHandler } from "@/utils/apiResponse";

export async function checkUsername(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const body = request.body;

    const validationResult = usernameValidation.safeParse(body);

    console.log("ValidationResult [username check]:", validationResult);

    if (!validationResult.success) {
      return responseHandler.sendError(
        reply,
        400,
        "Invalid username",
        validationResult.error,
      );
    }

    const username = validationResult.data;

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
