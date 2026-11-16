import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const remainingSeconds = Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000));

  return NextResponse.json({
    authenticated: true,
    username: session.username,
    expiresAt: session.expiresAt,
    expiresInSeconds: remainingSeconds,
  });
}
