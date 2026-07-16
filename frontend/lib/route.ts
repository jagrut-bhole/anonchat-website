export const PAGE_ROUTES = {
  HOME: "/",
  AUTH: {
    SIGN_IN: "/auth/sign-in",
    SIGN_UP: "/auth/sign-up",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
  },
  ONBOARDING: "/onboarding",
  DASHBOARD: "/dashboard",
} as const;

export const API_ROUTES = {
  AUTH: "/api/v1/auth",
  USERS: "/api/v1/users",
} as const;

export function getBackendBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:6969"
  ).replace(/\/$/, "");
}

export function getAuthApiUrl(path = "") {
  return `${getBackendBaseUrl()}${API_ROUTES.AUTH}${path}`;
}

export function getUsersApiUrl(path = "") {
  return `${getBackendBaseUrl()}${API_ROUTES.USERS}${path}`;
}

export function getPostAuthRoute(user?: {
  emailVerified?: boolean;
  username?: string | null;
  image?: string | null;
}) {
  if (!user?.emailVerified) return PAGE_ROUTES.AUTH.VERIFY_EMAIL;
  if (!user.username || !user.image) return PAGE_ROUTES.ONBOARDING;
  return PAGE_ROUTES.DASHBOARD;
}
