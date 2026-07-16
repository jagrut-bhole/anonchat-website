import type { FastifyInstance } from "fastify";
import { authenticate } from "@/middlewares/auth.middleware";
import { locationUpdate } from "@/controllers/location.controller";

export async function updateRoute(fastify: FastifyInstance) {
  fastify.put(
    "/location",
    {
      preHandler: authenticate,
    },
    locationUpdate,
  );
}
