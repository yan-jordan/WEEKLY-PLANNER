import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/session";
import { route } from "@/lib/http";
import { availabilitySchema } from "@/lib/validation";
import { getUser, setAvailability } from "@/server/users";

/** The logged-in user's profile. */
export const GET = route(async (req: Request) => {
  const user = await getUser(await requireUserId(req));
  return NextResponse.json({ user });
});

/** Update weekly availability (hours per day, Monday first). */
export const PATCH = route(async (req: Request) => {
  const userId = await requireUserId(req);
  const { availability } = availabilitySchema.parse(await req.json());
  return NextResponse.json({ availability: await setAvailability(userId, availability) });
});
