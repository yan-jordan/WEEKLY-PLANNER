import { db } from "@/lib/db";
import { llmConfigFromEnv } from "@/lib/planner/llm";
import { makePlan, type Plan } from "@/lib/planner";
import { currentWeek } from "@/lib/week";
import { assignDays } from "./tasks";
import { getAvailability } from "./users";

/** Days of `weekStart` that are still ahead of `now`: 0 for future weeks, 7 for past ones. */
export function firstOpenDay(weekStart: Date, now = new Date()): number {
  const thisWeek = currentWeek(now).getTime();
  if (weekStart.getTime() > thisWeek) return 0;
  if (weekStart.getTime() < thisWeek) return 7;
  return (now.getUTCDay() + 6) % 7;
}

export type PlanMode = "fill" | "rebalance";

/**
 * A proposed schedule for the week's open tasks. Nothing is saved until it is applied.
 *
 * - fill (default): tasks the user already put on an upcoming day stay where they are and
 *   their hours are taken out of that day's capacity; only unscheduled tasks and unfinished
 *   ones left on past days get placed.
 * - rebalance: every unfinished task is re-planned from scratch.
 */
export async function proposePlan(
  userId: string,
  weekStart: Date = currentWeek(),
  mode: PlanMode = "fill",
): Promise<Plan & { fromDay: number; mode: PlanMode }> {
  const [open, availability] = await Promise.all([
    db.task.findMany({
      where: { userId, weekStart, done: false },
      select: { id: true, title: true, hours: true, complexity: true, day: true },
      orderBy: { createdAt: "asc" },
    }),
    getAvailability(userId),
  ]);
  const fromDay = firstOpenDay(weekStart);

  const isPlaced = (day: number | null) => day !== null && day >= fromDay;
  const toPlan = mode === "rebalance" ? open : open.filter((t) => !isPlaced(t.day));
  const capacity = [...availability];
  if (mode === "fill") {
    for (const t of open) if (isPlaced(t.day)) capacity[t.day!] = Math.max(0, capacity[t.day!] - t.hours);
  }

  const tasks = toPlan.map(({ id, title, hours, complexity }) => ({ id, title, hours, complexity }));
  const plan = await makePlan({ tasks, availability: capacity, fromDay }, llmConfigFromEnv());
  return { ...plan, fromDay, mode };
}

export function applyPlan(userId: string, weekStart: Date, assignments: { taskId: string; day: number | null }[]) {
  return assignDays(userId, weekStart, assignments);
}
