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

/** A proposed schedule for the week's open tasks. Nothing is saved until it is applied. */
export async function proposePlan(userId: string, weekStart: Date = currentWeek()): Promise<Plan & { fromDay: number }> {
  const [tasks, availability] = await Promise.all([
    db.task.findMany({
      where: { userId, weekStart, done: false },
      select: { id: true, title: true, hours: true, complexity: true },
      orderBy: { createdAt: "asc" },
    }),
    getAvailability(userId),
  ]);
  const fromDay = firstOpenDay(weekStart);
  const plan = await makePlan({ tasks, availability, fromDay }, llmConfigFromEnv());
  return { ...plan, fromDay };
}

export function applyPlan(userId: string, weekStart: Date, assignments: { taskId: string; day: number | null }[]) {
  return assignDays(userId, weekStart, assignments);
}
