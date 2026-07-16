import { getAuthApiUrl, getUsersApiUrl } from "@/lib/route";

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

    return { data: (await response.json()) as T, error: null };
  } catch {
    return { data: null, error: "Unable to reach the server" };
  }
}

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  username?: string | null;
};

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
