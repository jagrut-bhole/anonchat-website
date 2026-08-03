import { NextRequest, NextResponse } from "next/server";
import { getAuthApiUrl, getPostAuthRoute, PAGE_ROUTES } from "@/lib/route";

type SessionResponse = {
  user?: {
    email?: string;
    emailVerified?: boolean;
    username?: string | null;
    image?: string | null;
  };
  session?: {
    userId?: string;
  };
};

type OnboardingCheckResponse = {
  success: boolean;
  data: {
    onboardingCompleted: boolean;
  };
};

const authRoutes = [
  PAGE_ROUTES.AUTH.SIGN_IN,
  PAGE_ROUTES.AUTH.SIGN_UP,
  PAGE_ROUTES.AUTH.FORGOT_PASSWORD,
  PAGE_ROUTES.AUTH.RESET_PASSWORD,
  PAGE_ROUTES.AUTH.VERIFY_EMAIL,
];

const protectedRoutes = [PAGE_ROUTES.DASHBOARD, PAGE_ROUTES.ONBOARDING, PAGE_ROUTES.PROFILE];

async function getSession(req: NextRequest) {
  try {
    const response = await fetch(getAuthApiUrl("/get-session"), {
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    if (!response.ok) return null;
    return (await response.json()) as SessionResponse | null;
  } catch {
    return null;
  }
}

async function getOnboardingStatus(req: NextRequest): Promise<boolean> {
  try {
    const baseUrl = (
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      process.env.BETTER_AUTH_URL ||
      "http://localhost:6969"
    ).replace(/\/$/, "");

    const response = await fetch(`${baseUrl}/api/v1/onboarding/check`, {
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    if (!response.ok) return false;
    const json = (await response.json()) as OnboardingCheckResponse;
    return json?.data?.onboardingCompleted ?? false;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAuthRoute = authRoutes.some((route) => pathname === route);
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!isAuthRoute && !isProtectedRoute && pathname !== PAGE_ROUTES.HOME) {
    return NextResponse.next();
  }

  const session = await getSession(req);

  if (!session?.user && isProtectedRoute) {
    return NextResponse.redirect(new URL(PAGE_ROUTES.AUTH.SIGN_IN, req.url));
  }

  if (session?.user) {
    const onboardingCompleted = await getOnboardingStatus(req);

    const userWithOnboarding = {
      ...session.user,
      onboardingCompleted,
    };

    if (isAuthRoute || pathname === PAGE_ROUTES.HOME) {
      return NextResponse.redirect(new URL(getPostAuthRoute(userWithOnboarding), req.url));
    }

    if (isProtectedRoute) {
      const expectedRoute = getPostAuthRoute(userWithOnboarding);
      if (expectedRoute !== pathname) {
        // Allow profile access if onboarding is completed
        if (pathname === PAGE_ROUTES.PROFILE && onboardingCompleted) {
          return NextResponse.next();
        }
        return NextResponse.redirect(new URL(expectedRoute, req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
    "/onboarding/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
  ],
};
