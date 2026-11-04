import type { Assignment, PlanInput } from "./types";

/**
 * Deterministic baseline scheduler.
 *
 * Places the hardest and longest tasks first, because they are the hardest to fit.
 * Each task goes to the open day with the best score:
 *   remaining hours on that day - 0.5 * complexity already placed on it
 * which balances hours across the week and avoids stacking hard tasks on one day.
 * Ties go to the earlier day. Tasks that fit nowhere stay unscheduled (day = null).
 */
export function greedyPlan({ tasks, availability, fromDay }: PlanInput): Assignment[] {
  const remaining = availability.map((h, d) => (d < fromDay ? 0 : h));
  const complexityLoad = Array(7).fill(0);

  const ordered = [...tasks].sort(
    (a, b) => b.complexity - a.complexity || b.hours - a.hours || a.title.localeCompare(b.title),
  );

  const byId = new Map<string, number | null>();
  for (const task of ordered) {
    let bestDay: number | null = null;
    let bestScore = -Infinity;
    for (let d = fromDay; d < 7; d++) {
      if (remaining[d] < task.hours) continue;
      const score = remaining[d] - 0.5 * complexityLoad[d];
      if (score > bestScore) {
        bestScore = score;
        bestDay = d;
      }
    }
    if (bestDay !== null) {
      remaining[bestDay] -= task.hours;
      complexityLoad[bestDay] += task.complexity;
    }
    byId.set(task.id, bestDay);
  }

  // Return in the caller's original order so results are easy to compare.
  return tasks.map((t) => ({ taskId: t.id, day: byId.get(t.id) ?? null }));
}
