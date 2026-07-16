import type { FastifyInstance } from "fastify";
import { authenticate } from "@/middlewares/auth.middleware";
import { checkUsername } from "@/controllers/userCheck.controller";

export async function checkUsernameRoute(fastify: FastifyInstance) {
  fastify.post(
    "/checkusername",
    {
      preHandler: authenticate,
    },
    checkUsername,
  );
}
