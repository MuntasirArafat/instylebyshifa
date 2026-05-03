import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "instylebyshifa_secret_key_123");

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1. Protect all /admin routes except /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    try {
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch (e) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // 2. Redirect logged-in admin away from login page
  if (pathname === "/admin/login") {
    const token = req.cookies.get("admin_token")?.value;
    if (token) {
      try {
        await jwtVerify(token, SECRET);
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      } catch (e) {
        // Token invalid, allow access to login
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
