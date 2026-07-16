import type { FastifyReply } from "fastify";

export class responseHandler {
  static sendSuccess<T>(
    reply: FastifyReply,
    statusCode: number,
    message: string,
    data?: T
  ) {
    return reply.status(statusCode).send({
      success: true,
      message,
      error: null,
      data: data ?? null,
    });
  }

  static sendError(
    reply: FastifyReply,
    statusCode: number,
    message: string,
    error?: unknown
  ) {
    return reply.status(statusCode).send({
      success: false,
      message,
      error: error instanceof Error ? error.message : error ? String(error) : null,
      data: null
    });
  }
}