import { NextRequest, NextResponse } from "next/server";
import { getAuthApiUrl, getPostAuthRoute, PAGE_ROUTES } from "@/lib/route";

type SessionResponse = {
  user?: {
    email?: string;
    emailVerified?: boolean;
    username?: string | null;
    image?: string | null;
  };
};

const authRoutes = [
  PAGE_ROUTES.AUTH.SIGN_IN,
  PAGE_ROUTES.AUTH.SIGN_UP,
  PAGE_ROUTES.AUTH.FORGOT_PASSWORD,
  PAGE_ROUTES.AUTH.RESET_PASSWORD,
  PAGE_ROUTES.AUTH.VERIFY_EMAIL,
];

const protectedRoutes = [PAGE_ROUTES.DASHBOARD, PAGE_ROUTES.ONBOARDING];

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

  if (session?.user && (isAuthRoute || pathname === PAGE_ROUTES.HOME)) {
    return NextResponse.redirect(new URL(getPostAuthRoute(session.user), req.url));
  }

  if (session?.user && isProtectedRoute) {
    const expectedRoute = getPostAuthRoute(session.user);
    if (expectedRoute !== pathname) {
      return NextResponse.redirect(new URL(expectedRoute, req.url));
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
  ],
};
