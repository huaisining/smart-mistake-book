import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Public API routes that don't require authentication
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/register")
  ) {
    return NextResponse.next();
  }

  // Protected routes
  const protectedRoutes = [
    "/dashboard",
    "/mistakes",
    "/review",
    "/add",
    "/api",
  ];

  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/mistakes/:path*",
    "/review/:path*",
    "/add/:path*",
    "/api/:path*",
  ],
};
