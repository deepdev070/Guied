import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifySessionToken, type AdminUser } from "./auth";

/**
 * Returns the currently authenticated admin user, or null if unauthenticated or expired.
 */
export async function getAdminSession(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/**
 * Server-side guard for protected admin pages.
 * Redirects unauthenticated or expired users to /admin/login.
 */
export async function requireAdminSession(): Promise<AdminUser> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
