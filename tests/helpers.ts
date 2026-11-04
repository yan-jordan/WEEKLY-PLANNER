import { db } from "@/lib/db";

export async function resetDb() {
  await db.$executeRawUnsafe('TRUNCATE "Task", "User" RESTART IDENTITY CASCADE');
}

export function jsonRequest(url: string, method: string, body?: unknown, cookie?: string) {
  return new Request(`http://localhost${url}`, {
    method,
    headers: { "content-type": "application/json", ...(cookie && { cookie }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** Extracts "name=value" from a Set-Cookie header so it can be replayed on the next request. */
export function sessionCookie(res: Response): string {
  const header = res.headers.get("set-cookie");
  if (!header) throw new Error("response did not set a cookie");
  return header.split(";")[0];
}

export const params = (id: string) => ({ params: Promise.resolve({ id }) });
