import { z } from "zod";
import { VALID_AVATAR_STYLES } from "@/constants/avatar";

export const generateSeedsSchema = z.object({
  style: z.enum(VALID_AVATAR_STYLES as [string, ...string[]], {
    errorMap: () => ({ message: "Invalid avatar style" }),
  }),
});
