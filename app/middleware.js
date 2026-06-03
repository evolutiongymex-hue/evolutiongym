import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/admin" || pathname === "/admin/login";

  if (isLoginPage) return NextResponse.next();

  const token = request.cookies.get("admin_token")?.value;

  if (!token || token !== process.env.ADMIN_SECRET_TOKEN) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};