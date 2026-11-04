import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "./session";

/**
 * For server components: the logged-in user's id, or null.
 * Also checks the user still exists, so a valid cookie for a deleted account counts as logged out.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const store = await cookies();
  const userId = await verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  const exists = await db.user.count({ where: { id: userId } });
  return exists ? userId : null;
}

/** For server components on protected pages: redirects to /login when there is no session. */
export async function requireCurrentUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  return userId;
}
