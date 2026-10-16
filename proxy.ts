import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth((request) => {
  const isLoggedIn = !!request.auth;
  const pathname = request.nextUrl.pathname;

  // no login -> login page
  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // logged-in -> dashboard and cant go back to login
  if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
