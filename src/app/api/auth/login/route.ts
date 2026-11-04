import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { route } from "@/lib/http";
import { loginSchema } from "@/lib/validation";
import { authenticate } from "@/server/users";

export const POST = route(async (req: Request) => {
  const input = loginSchema.parse(await req.json());
  const user = await authenticate(input);
  const res = NextResponse.json({ user });
  setSessionCookie(res, await createSessionToken(user.id));
  return res;
});
