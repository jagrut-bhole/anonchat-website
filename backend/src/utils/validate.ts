import { z } from "zod";
import type { FastifyReply } from "fastify";
import { responseHandler } from "./apiResponse";

export function validateData<T extends z.ZodType>(
  schema: T,
  data: unknown,
  reply: FastifyReply,
): z.infer<T> | null {
  const validation = schema.safeParse(data);

  if (!validation.success) {
    responseHandler.sendValidationError(
      reply,
      validation.error,
      "Validation Error!!",
    );

    return null;
  }

  return validation.data;
}
