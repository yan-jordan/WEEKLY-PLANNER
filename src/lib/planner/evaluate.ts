import type { Assignment, PlanInput } from "./types";

export type PlanMetrics = {
  /** Hard-constraint problems. A plan with any violation must not be applied. */
  violations: string[];
  scheduledTasks: number;
  unscheduledTasks: number;
  scheduledHours: number;
  totalHours: number;
  /** Hours planned per day. */
  dailyHours: number[];
  /** Standard deviation of load / capacity across open days. Lower = better balanced. */
  imbalance: number;
  /** Highest summed complexity on a single day. */
  peakComplexity: number;
};

export function evaluatePlan(input: PlanInput, assignments: Assignment[]): PlanMetrics {
  const violations: string[] = [];
  const tasks = new Map(input.tasks.map((t) => [t.id, t]));
  const seen = new Set<string>();
  const dailyHours = Array(7).fill(0);
  const dailyComplexity = Array(7).fill(0);

  for (const a of assignments) {
    const task = tasks.get(a.taskId);
    if (!task) {
      violations.push(`unknown task id ${a.taskId}`);
      continue;
    }
    if (seen.has(a.taskId)) violations.push(`task ${a.taskId} assigned twice`);
    seen.add(a.taskId);
    if (a.day === null) continue;
    if (!Number.isInteger(a.day) || a.day < 0 || a.day > 6) {
      violations.push(`task ${a.taskId} has invalid day ${a.day}`);
      continue;
    }
    if (a.day < input.fromDay) violations.push(`task ${a.taskId} scheduled on a past day`);
    dailyHours[a.day] += task.hours;
    dailyComplexity[a.day] += task.complexity;
  }

  for (const id of tasks.keys()) if (!seen.has(id)) violations.push(`task ${id} missing from plan`);
  dailyHours.forEach((h, d) => {
    if (h > input.availability[d]) violations.push(`day ${d} overbooked: ${h}h planned, ${input.availability[d]}h available`);
  });

  const open = [...Array(7).keys()].filter((d) => d >= input.fromDay && input.availability[d] > 0);
  const ratios = open.map((d) => dailyHours[d] / input.availability[d]);
  const mean = ratios.reduce((s, r) => s + r, 0) / (ratios.length || 1);
  const imbalance = Math.sqrt(ratios.reduce((s, r) => s + (r - mean) ** 2, 0) / (ratios.length || 1));

  const scheduled = assignments.filter((a) => a.day !== null && tasks.has(a.taskId));
  return {
    violations,
    scheduledTasks: scheduled.length,
    unscheduledTasks: input.tasks.length - scheduled.length,
    scheduledHours: dailyHours.reduce((s, h) => s + h, 0),
    totalHours: input.tasks.reduce((s, t) => s + t.hours, 0),
    dailyHours,
    imbalance: Math.round(imbalance * 1000) / 1000,
    peakComplexity: Math.max(0, ...dailyComplexity),
  };
}
