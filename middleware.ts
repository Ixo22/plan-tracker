import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { role } = req.nextauth.token as { role?: string };
    const { pathname } = req.nextUrl;

    if ((pathname.startsWith("/dashboard") || pathname.startsWith("/inbox")) && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/plans/new", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/inbox/:path*", "/plans/:path*"],
};
