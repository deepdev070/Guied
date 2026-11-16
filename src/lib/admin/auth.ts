import crypto from "node:crypto";
import bcrypt from "bcryptjs";

export const ADMIN_SESSION_COOKIE = "civic_admin_session";
export const ADMIN_CSRF_COOKIE = "civic_admin_csrf";
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 hours in seconds (Prompt 103)
export const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;

// Default development hash for password "Admin@Civic2026!" if ADMIN_PASSWORD_HASH is unset
const DEFAULT_DEV_HASH = "$2b$10$eSILP76OXsLwrFTUFxXpQuf5xranJSGTPDUpO3KnR019sbCyxsybe";
const DEFAULT_DEV_SECRET = "paperwork-guide-admin-session-secret-key-2026";

export interface AdminSessionPayload {
  u: string; // username
  i: number; // issuedAt
  e: number; // expiresAt
}

export interface AdminUser {
  username: string;
  expiresAt: number;
}

export function getAdminConfig() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || DEFAULT_DEV_HASH;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET || DEFAULT_DEV_SECRET;

  return { username, passwordHash, sessionSecret };
}

/**
 * Verifies admin username and password against environment hash using bcrypt.
 */
export async function verifyAdminCredentials(
  usernameInput: string,
  passwordInput: string
): Promise<boolean> {
  const { username, passwordHash } = getAdminConfig();

  const isUsernameMatch = usernameInput.trim() === username;
  if (!isUsernameMatch) {
    // Run dummy compare to mitigate timing attacks
    await bcrypt.compare("dummy-password", DEFAULT_DEV_HASH);
    return false;
  }

  return bcrypt.compare(passwordInput, passwordHash);
}

/**
 * Creates an HMAC SHA-256 signed session token that expires after 8 hours.
 */
export function createSessionToken(username: string): string {
  const { sessionSecret } = getAdminConfig();
  const now = Date.now();
  const payload: AdminSessionPayload = {
    u: username,
    i: now,
    e: now + SESSION_MAX_AGE_MS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", sessionSecret).update(encodedPayload).digest("hex");

  return `${encodedPayload}.${signature}`;
}

/**
 * Validates session token signature and 8-hour expiration.
 * Returns decoded session or null if invalid or expired.
 */
export function verifySessionToken(token: string | null | undefined): AdminUser | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encodedPayload, providedSignature] = parts;
  if (!encodedPayload || !providedSignature) return null;

  const { sessionSecret } = getAdminConfig();
  const expectedSignature = crypto
    .createHmac("sha256", sessionSecret)
    .update(encodedPayload)
    .digest("hex");

  // Constant-time signature comparison to prevent timing leaks
  const expectedBuf = Buffer.from(expectedSignature, "utf8");
  const providedBuf = Buffer.from(providedSignature, "utf8");

  if (expectedBuf.length !== providedBuf.length) return null;
  if (!crypto.timingSafeEqual(expectedBuf, providedBuf)) return null;

  try {
    const raw = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const payload = JSON.parse(raw) as AdminSessionPayload;

    if (!payload.u || !payload.e) return null;

    // Automatic logout after 8 hours
    if (Date.now() > payload.e) {
      return null;
    }

    return {
      username: payload.u,
      expiresAt: payload.e,
    };
  } catch {
    return null;
  }
}

/**
 * Generates a cryptographically strong 32-byte CSRF token.
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Compares two CSRF tokens in constant-time.
 */
export function verifyCsrfToken(
  tokenA: string | null | undefined,
  tokenB: string | null | undefined
): boolean {
  if (!tokenA || !tokenB) return false;
  const bufA = Buffer.from(tokenA, "utf8");
  const bufB = Buffer.from(tokenB, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Cookie options for admin session cookie.
 * Always httpOnly and Lax sameSite.
 */
export function getSessionCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

/**
 * Cookie options for CSRF token cookie.
 */
export function getCsrfCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: false, // Accessible to client-side form logic to send via header
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
