import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { route } from "@/lib/http";
import { signupSchema } from "@/lib/validation";
import { createUser } from "@/server/users";

export const POST = route(async (req: Request) => {
  const input = signupSchema.parse(await req.json());
  const user = await createUser(input);
  const res = NextResponse.json({ user }, { status: 201 });
  setSessionCookie(res, await createSessionToken(user.id));
  return res;
});
