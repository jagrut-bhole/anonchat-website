import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special characters");

export const getUser = z.object({
  userId: z.string()
})

export const otherUser = z.object({
  otherUserId: z.string()
})