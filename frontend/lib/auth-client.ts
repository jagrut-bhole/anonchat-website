import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { emailOTPClient } from "better-auth/client/plugins";
import { API_ROUTES } from "./route";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  basePath: API_ROUTES.AUTH,
  plugins: [
    inferAdditionalFields({
      user: {
        username: {
          type: "string",
          required: false
        },
        displayUsername: {
          type: "string",
          required: false
        }
      }
    }),
    emailOTPClient(),
  ],
  fetchOptions: {
    credentials: "include",
  }
})
