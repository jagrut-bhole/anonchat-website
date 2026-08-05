import { MESSAGES_PER_PAGE } from "@/constants/group";
import { z } from "zod";

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(3, "Group name must be at least 3 characters long")
    .max(50, "Group name must be at most 50 characters long"),

  description: z
    .string()
    .max(500, "Description must be at most 500 characters long"),

  maxMembers: z.number().max(50).optional(),
  expiryDate: z
    .string()
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date > new Date();
      },
      {
        message: "Expiry date must be a valid date in the future",
        path: ["expiryDate"],
      },
    )
    .optional(),

  latitude: z.number().refine((val) => val >= -90 && val <= 90, {
    message: "Latitude must be between -90 and 90",
  }),
  longitude: z.number().refine((val) => val >= -180 && val <= 180, {
    message: "Longitude must be between -180 and 180",
  }),
});

export const groupLinkSchema = z.object({
  groupId: z.string().min(1)
});

export const groupMessagesQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(MESSAGES_PER_PAGE)
})