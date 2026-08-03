import { z } from "zod";
import { VALID_AVATAR_STYLES } from "@/constants/avatar";

export const onboardingSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username must only contain letters, numbers, or underscores")
    .transform((val) => val.toLowerCase()),
  avatarStyle: z.enum(VALID_AVATAR_STYLES, {
    errorMap: () => ({ message: "Invalid avatar style" }),
  }),
  avatarSeed: z
    .string()
    .min(1, "Avatar seed is required"),
  avatarBackgroundColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Background color must be a valid hex color (e.g. #FF5500)")
    .default("#007AFF"),
  selectedDistance: z
    .number()
    .min(5, "Minimum distance is 5 km")
    .max(50, "Maximum distance is 50 km")
    .default(25),
  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .optional(),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .optional(),
});