import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth/session";
import { route } from "@/lib/http";
import { getInsights } from "@/server/insights";

const query = z.object({ weeks: z.coerce.number().int().min(1).max(52).default(8) });

/** GET /api/insights?weeks=8 — completion trend and estimate accuracy. */
export const GET = route(async (req: Request) => {
  const userId = await requireUserId(req);
  const { weeks } = query.parse(Object.fromEntries(new URL(req.url).searchParams));
  return NextResponse.json(await getInsights(userId, weeks));
});
