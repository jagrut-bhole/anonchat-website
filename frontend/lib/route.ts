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
  PROFILE: "/profile",
  LIVE_CHAT: "/live-chat",
} as const;

export const API_ROUTES = {
  AUTH: "/api/v1/auth",
  USERS: "/api/v1/users",
  ONBOARDING: "/api/v1/onboarding",
  CHECK_USERNAME: "/api/v1/checkusername",
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

export function getOnboardingApiUrl(path = "") {
  return `${getBackendBaseUrl()}${API_ROUTES.ONBOARDING}${path}`;
}

export function getCheckUsernameApiUrl(path = "") {
  return `${getBackendBaseUrl()}${API_ROUTES.CHECK_USERNAME}${path}`;
}

export function getPostAuthRoute(user?: {
  emailVerified?: boolean;
  username?: string | null;
  onboardingCompleted?: boolean;
}) {
  if (!user?.emailVerified) return PAGE_ROUTES.AUTH.VERIFY_EMAIL;
  if (!user.onboardingCompleted) return PAGE_ROUTES.ONBOARDING;
  return PAGE_ROUTES.DASHBOARD;
}
