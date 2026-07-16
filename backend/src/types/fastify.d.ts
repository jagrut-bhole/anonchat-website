import type { Session } from "@/lib/auth";

declare module "fastify" {
  interface FastifyRequest {
    session: Session["session"];
    user: Session["user"];
  }
}