import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { emailOTP, username } from "better-auth/plugins";
import { redisSecondaryStorage } from "@/lib/redis/secondary-storage";
import { getAuthEmailTemplate } from "@/utils/email-templates";
import { sendEmail } from "@/utils/mailer";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: "/api/v1/auth",

  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),

  secondaryStorage: redisSecondaryStorage,
  verification: {
    storeInDatabase: false,
  },

  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
  },

  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignIn: true,
  },

  user: {
    deleteUser: {
      enabled: true,
    },
  },

  plugins: [
    username(),
    emailOTP({
      expiresIn: 60 * 10,
      allowedAttempts: 5,
      storeOTP: "hashed",
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {

        try {
          const template = getAuthEmailTemplate(type, otp);
          await sendEmail({ to: email, ...template });
        } catch (error) {
          console.warn("[Mailer] Could not send email, but OTP is logged above in console.");
        }
      },
    }),
  ],

  trustedOrigins: (process.env.ALLOWED_ORIGINS || "").split(","),

  session: {
    expiresIn: 60 * 60 * 24 * 20, // 20 days
    updateAge: 60 * 60 * 24 * 10, // 10 days
    storeSessionInDatabase: true,
  },
  
  advanced: {
    ipAddress: {
      disableIpTracking: true,

      ipAddressHeaders: [
        "x-client-ip",
        "x-forwarded-for",
        "cf-connecting-ip",
        "x-real-ip"
      ],
    },
    crossSubDomainCookies: {
      enabled: true
    },
    defaultCookieAttributes: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === "production"
    },
    cookiePrefix: "anonchat"
  },
});

export type Session = typeof auth.$Infer.Session;
