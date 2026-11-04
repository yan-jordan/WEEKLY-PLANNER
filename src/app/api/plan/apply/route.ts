import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/session";
import { route } from "@/lib/http";
import { applyPlanSchema } from "@/lib/validation";
import { applyPlan } from "@/server/plan";

/** POST /api/plan/apply — save a (possibly edited) plan. All-or-nothing. */
export const POST = route(async (req: Request) => {
  const userId = await requireUserId(req);
  const { week, assignments } = applyPlanSchema.parse(await req.json());
  await applyPlan(userId, week, assignments);
  return new NextResponse(null, { status: 204 });
});
