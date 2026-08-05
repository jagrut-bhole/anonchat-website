import type { Session } from "@/lib/auth";
import type { AuthUser } from "@/helper/authHelper";
import type { UserLocation } from "@/helper/locationHelper";

declare module "fastify" {
  interface FastifyRequest {
    session?: Session["session"];
    user?: Session["user"];
    authUser?: AuthUser;
    userLocation?: UserLocation;
  }
}