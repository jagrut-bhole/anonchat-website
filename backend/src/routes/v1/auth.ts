import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@/lib/auth";
import { consumeChangePasswordOtp, generateOtp, storeChangePasswordOtp } from "@/utils/otp";
import { getAuthEmailTemplate } from "@/utils/email-templates";
import { sendEmail } from "@/utils/mailer";

type AuthBody = Record<string, unknown>;

function getPath(url: string): string {
  return url.split("?")[0] || "";
}

async function dispatchBetterAuth(
  request: FastifyRequest,
  reply: FastifyReply,
  path = request.url,
  body = request.body,
) {
  const baseUrl = process.env.BETTER_AUTH_URL || `${request.protocol}://${request.hostname}`;
  const headers = fromNodeHeaders(request.headers);
  headers.delete("content-length");
  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD" && body !== undefined;
  const response = await auth.handler(new Request(new URL(path, baseUrl), {
    method,
    headers,
    body: hasBody ? JSON.stringify(body) : undefined,
  }));

  response.headers.forEach((value, key) => {
    if (key !== "set-cookie") reply.header(key, value);
  });

  const setCookies = response.headers.getSetCookie();
  if (setCookies.length > 0) reply.header("set-cookie", setCookies);

  return reply.status(response.status).send(Buffer.from(await response.arrayBuffer()));
}

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/auth/change-password/request-otp", async (request, reply) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session) {
      return reply.status(401).send({ success: false, message: "Unauthorized" });
    }

    const otp = generateOtp();
    await storeChangePasswordOtp(session.user.id, otp);
    await sendEmail({
      to: session.user.email,
      ...getAuthEmailTemplate("change-password", otp),
    });

    return reply.send({ success: true, message: "Password change OTP sent" });
  });

  fastify.all("/auth/*", async (request, reply) => {
    const path = getPath(request.url);
    const body = (request.body || {}) as AuthBody;

    if (path === "/api/v1/auth/delete-user" && request.method === "POST") {
      if (typeof body.password !== "string" || body.password.length === 0) {
        return reply.status(400).send({
          success: false,
          message: "Password is required to delete the account",
        });
      }
    }

    if (path === "/api/v1/auth/change-password" && request.method === "POST") {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session) {
        return reply.status(401).send({ success: false, message: "Unauthorized" });
      }

      if (typeof body.otp !== "string" || !(await consumeChangePasswordOtp(session.user.id, body.otp))) {
        return reply.status(400).send({
          success: false,
          message: "Invalid or expired password change OTP",
        });
      }
    }

    if (path === "/api/v1/auth/forget-password" && request.method === "POST") {
      return dispatchBetterAuth(
        request,
        reply,
        "/api/v1/auth/email-otp/request-password-reset",
        body,
      );
    }

    if (
      path === "/api/v1/auth/reset-password"
      && request.method === "POST"
      && typeof body.email === "string"
      && typeof body.otp === "string"
    ) {
      return dispatchBetterAuth(
        request,
        reply,
        "/api/v1/auth/email-otp/reset-password",
        {
          email: body.email,
          otp: body.otp,
          password: body.password || body.newPassword,
        },
      );
    }

    return dispatchBetterAuth(request, reply);
  });
};

export default authRoutes;
