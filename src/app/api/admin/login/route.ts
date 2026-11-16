import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limiter";
import {
  ADMIN_CSRF_COOKIE,
  ADMIN_SESSION_COOKIE,
  createSessionToken,
  getSessionCookieOptions,
  verifyAdminCredentials,
  verifyCsrfToken,
} from "@/lib/admin/auth";

const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  csrfToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting by IP: maximum 5 login attempts per 15 minutes
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(`admin-login:${ip}`, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
    });

    if (!rateLimit.allowed) {
      const waitMinutes = Math.ceil((rateLimit.resetTime - Date.now()) / 60000);
      return NextResponse.json(
        {
          error: `Too many login attempts. Please try again in ${waitMinutes} minute${waitMinutes > 1 ? "s" : ""}.`,
        },
        { status: 429 }
      );
    }

    // 2. Validate input
    const body = await req.json().catch(() => null);
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const { username, password, csrfToken } = parsed.data;

    // 3. CSRF Verification
    const headerCsrf = req.headers.get("x-csrf-token");
    const cookieCsrf = req.cookies.get(ADMIN_CSRF_COOKIE)?.value;
    const clientCsrf = headerCsrf || csrfToken;

    if (!verifyCsrfToken(clientCsrf, cookieCsrf)) {
      return NextResponse.json(
        { error: "Invalid or expired security token. Please refresh the page and try again." },
        { status: 403 }
      );
    }

    // 4. Verify admin credentials
    const isValid = await verifyAdminCredentials(username, password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // 5. Create 8-hour HMAC signed session token
    const sessionToken = createSessionToken(username);

    const res = NextResponse.json({
      ok: true,
      username,
      message: "Authentication successful",
    });

    // 6. Set httpOnly session cookie
    res.cookies.set(ADMIN_SESSION_COOKIE, sessionToken, getSessionCookieOptions());

    return res;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}
