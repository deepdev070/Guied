import { NextResponse } from "next/server";
import { ADMIN_CSRF_COOKIE, ADMIN_SESSION_COOKIE } from "@/lib/admin/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true, message: "Logged out successfully" });

  res.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  res.cookies.set(ADMIN_CSRF_COOKIE, "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}
