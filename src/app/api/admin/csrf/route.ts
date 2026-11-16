import { NextResponse } from "next/server";
import { ADMIN_CSRF_COOKIE, generateCsrfToken, getCsrfCookieOptions } from "@/lib/admin/auth";

export async function GET() {
  const token = generateCsrfToken();
  const res = NextResponse.json({ csrfToken: token });
  res.cookies.set(ADMIN_CSRF_COOKIE, token, getCsrfCookieOptions());
  return res;
}
