import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";

import auth from "./routes/v1/auth";

import type { FastifyPluginAsync } from "fastify";

// Routes
import { userRoutes } from "./routes/v1/user";
import { checkUsernameRoute } from "./routes/v1/check";
import { groupRoutes } from "./routes/v1/group";

const server = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "warn" : "info",
  },
});

await server.register(cors, {
  origin: (process.env.ALLOWED_ORIGINS || "").split(","),
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposedHeaders: ["Content-Length"],
  maxAge: 600,
  credentials: true,
});

const routes: {
  path: string;
  route: FastifyPluginAsync;
}[] = [
  {
    path: "",
    route: auth,
  },
];

for (const { path, route } of routes) {
  await server.register(route, {
    prefix: `/api/v1${path}`,
  });
}

server.register(userRoutes, {
  prefix: "/api/v1/users",
});

server.register(groupRoutes, {
  prefix: "/api/v1/groups",
})

server.get("/ping", async (request, reply) => {
  return "pong\n";
});

server.register(checkUsernameRoute, {
  prefix: "/api/v1/checkusername",
});

server.setNotFoundHandler(async (_request, reply) => {
  return reply.status(404).send({
    error: "Not implemented",
  });
});

server.listen(
  {
    port: 6969,
    host: "0.0.0.0",
  },
  (err, address) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    console.log(`Server is listening on http://localhost:6969`);
  },
);
