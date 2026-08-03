import { getAuthApiUrl, getUsersApiUrl, getOnboardingApiUrl, getCheckUsernameApiUrl } from "@/lib/route";

type ApiResult<T> = {
  data: T | null;
  error: string | null;
};

async function readError(response: Response) {
  try {
    const body = await response.json();
    return body?.message || body?.error || "Request failed";
  } catch {
    return "Request failed";
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    if (!response.ok) {
      return { data: null, error: await readError(response) };
    }

    const json = await response.json();
    const payload =
      json && typeof json === "object" && "success" in json && "data" in json && json.data !== null
        ? json.data
        : json;

    return { data: payload as T, error: null };
  } catch {
    return { data: null, error: "Unable to reach the server" };
  }
}

// ─── Auth User Type ─────────────────────────────────────────

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  username?: string | null;
  avatarStyle?: string | null;
  avatarSeed?: string | null;
  avatarBackgroundColor?: string | null;
  avatarVersion?: string | null;
  onboardingCompleted?: boolean;
};

// ─── Auth API ───────────────────────────────────────────────

export async function sendEmailVerificationOtp(email: string) {
  return request<{ success: boolean }>(getAuthApiUrl("/email-otp/send-verification-otp"), {
    method: "POST",
    body: JSON.stringify({ email, type: "email-verification" }),
  });
}

export async function verifyEmailOtp(email: string, otp: string) {
  return request<{ status: boolean; token: string | null; user: AuthUser }>(
    getAuthApiUrl("/email-otp/verify-email"),
    {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }
  );
}

export async function requestPasswordResetOtp(email: string) {
  return request<{ success: boolean }>(getAuthApiUrl("/email-otp/request-password-reset"), {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function checkPasswordResetOtp(email: string, otp: string) {
  return request<{ success: boolean }>(getAuthApiUrl("/email-otp/check-verification-otp"), {
    method: "POST",
    body: JSON.stringify({ email, otp, type: "forget-password" }),
  });
}

export async function resetPasswordWithOtp(email: string, otp: string, password: string) {
  return request<{ success: boolean }>(getAuthApiUrl("/email-otp/reset-password"), {
    method: "POST",
    body: JSON.stringify({ email, otp, password }),
  });
}

export async function getMe() {
  return request<{ success: boolean; user: AuthUser }>(getUsersApiUrl("/me"));
}

export async function completeOnboarding(input: { username: string; image: string }) {
  return request<{ success: boolean; user: AuthUser }>(getUsersApiUrl("/onboarding"), {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// ─── Onboarding API ─────────────────────────────────────────

export type OnboardingStatus = {
  onboardingCompleted: boolean;
  username: string | null;
  avatarStyle: string | null;
  avatarSeed: string | null;
  avatarBackgroundColor: string | null;
};

export async function checkOnboardingStatus() {
  return request<OnboardingStatus>(getOnboardingApiUrl("/check"));
}

export type AvatarOption = {
  seed: string;
  url: string;
};

export type GeneratedAvatars = {
  style: string;
  avatars: AvatarOption[];
};

export async function generateAvatarSeeds(style: string) {
  return request<GeneratedAvatars>(getOnboardingApiUrl("/generate-seeds"), {
    method: "POST",
    body: JSON.stringify({ style }),
  });
}

export type OnboardingCompleteInput = {
  username: string;
  avatarStyle: string;
  avatarSeed: string;
  avatarBackgroundColor: string;
  selectedDistance?: number;
  latitude?: number;
  longitude?: number;
};

export async function completeOnboardingFull(input: OnboardingCompleteInput) {
  return request<{ user: AuthUser; onboardingCompleted: boolean }>(
    getOnboardingApiUrl("/complete"),
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

// ─── Username Check ─────────────────────────────────────────

export async function checkUsernameAvailability(username: string) {
  return request<{ success: boolean }>(getCheckUsernameApiUrl("/checkusername"), {
    method: "POST",
    body: JSON.stringify(username),
  });
}

// ─── Profile API ────────────────────────────────────────────

export type UserProfile = {
  id: string;
  username: string | null;
  email: string;
  emailVerified: boolean;
  avatarStyle: string | null;
  avatarSeed: string | null;
  avatarBackgroundColor: string | null;
  avatarVersion: string | null;
  location: string | null;
  lastLocation: string | null;
  selectedDistance: number;
  createdAt: string;
  accounts: { onboardingCompleted: boolean }[];
};

export async function getUserProfile() {
  return request<UserProfile>(getUsersApiUrl("/profile"));
}

// ─── Session API ────────────────────────────────────────────

export type SessionInfo = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
};

export async function getActiveSessions() {
  return request<{ sessions: SessionInfo[] }>(getUsersApiUrl("/sessions"));
}

export async function revokeSession(sessionId: string) {
  return request<{ success: boolean }>(getUsersApiUrl(`/sessions/${sessionId}`), {
    method: "DELETE",
  });
}
