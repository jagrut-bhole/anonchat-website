import type { FastifyInstance } from "fastify";
import {
  createGroup,
  findGroup,
  getJoinedGroups,
  getGroupMembers,
  joiningGroup,
  leaveGroup
} from "@/controllers/group.controller";
import { authenticate } from "@/middlewares/auth.middleware";

export async function groupRoutes(app: FastifyInstance) {
  app.post(
    "/create",
    {
      preHandler: authenticate
    },
    createGroup
  );

  app.get(
    "/find",
    {
      preHandler: authenticate
    },
    findGroup
  );

  app.get(
    "/joinedGroups",
    {
      preHandler: authenticate
    },
    getJoinedGroups
  );

  app.get<{
    Params: {
      groupId: string
    }
  }>(
    "/members/:groupId",
    {
      preHandler: authenticate
    },
    getGroupMembers
  );

  app.post<{
    Params: {
      groupId: string
    }
  }>(
    "/join/:groupId",
    {
      preHandler: authenticate
    },
    joiningGroup
  );

  app.post<{
    Params: {
      groupId: string
    }
  }>(
    "/leave/:groupId",
    {
      preHandler: authenticate
    },
    leaveGroup
  );
}