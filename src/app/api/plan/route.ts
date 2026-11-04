import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/session";
import { route } from "@/lib/http";
import { planRequestSchema } from "@/lib/validation";
import { proposePlan } from "@/server/plan";

/** POST /api/plan — propose a schedule for the week's open tasks (read-only preview). */
export const POST = route(async (req: Request) => {
  const userId = await requireUserId(req);
  const text = await req.text();
  const { week, mode } = planRequestSchema.parse(text ? JSON.parse(text) : {});
  return NextResponse.json({ plan: await proposePlan(userId, week, mode) });
});
