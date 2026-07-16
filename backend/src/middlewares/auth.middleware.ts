import type { FastifyRequest, FastifyReply } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@/lib/auth";

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const data = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!data) {
    return reply.status(401).send({
      success: false,
      message: "Unauthorized",
    });
  }

  request.session = data.session;
  request.user = data.user;
}
