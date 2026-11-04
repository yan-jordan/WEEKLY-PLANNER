import { db } from "@/lib/db";
import { addWeeks, currentWeek, formatWeek } from "@/lib/week";

export type WeekStat = { week: string; tasks: number; done: number; plannedHours: number; doneHours: number };
export type ComplexityStat = {
  complexity: number;
  tasks: number;
  completionRate: number;
  /** Tasks where the actual time was recorded. */
  measured: number;
  /** Average of actualHours / estimated hours. 1.0 = perfect, 1.5 = takes 50% longer than planned. */
  estimateRatio: number | null;
};

/**
 * Productivity insights over the last `weeks` weeks, computed in SQL so the work stays in
 * the database no matter how many tasks a user has.
 */
export async function getInsights(userId: string, weeks = 8, now = new Date()) {
  const to = currentWeek(now);
  const from = addWeeks(to, -(weeks - 1));

  const [weekly, byComplexity] = await Promise.all([
    db.$queryRaw<{ week: Date; tasks: bigint; done: bigint; planned_hours: bigint; done_hours: bigint }[]>`
      SELECT w.week::date                                         AS week,
             COUNT(t.id)                                          AS tasks,
             COUNT(t.id) FILTER (WHERE t.done)                    AS done,
             COALESCE(SUM(t.hours), 0)                            AS planned_hours,
             COALESCE(SUM(t.hours) FILTER (WHERE t.done), 0)      AS done_hours
      FROM generate_series(${from}::date, ${to}::date, interval '7 days') AS w(week)
      LEFT JOIN "Task" t ON t."weekStart" = w.week::date AND t."userId" = ${userId}
      GROUP BY w.week
      ORDER BY w.week`,
    db.$queryRaw<{ complexity: number; tasks: bigint; done: bigint; measured: bigint; ratio: number | null }[]>`
      SELECT complexity,
             COUNT(*)                                                         AS tasks,
             COUNT(*) FILTER (WHERE done)                                     AS done,
             COUNT(*) FILTER (WHERE "actualHours" IS NOT NULL)                AS measured,
             AVG("actualHours"::float / hours) FILTER (WHERE "actualHours" IS NOT NULL) AS ratio
      FROM "Task"
      WHERE "userId" = ${userId} AND "weekStart" BETWEEN ${from}::date AND ${to}::date
      GROUP BY complexity
      ORDER BY complexity`,
  ]);

  const weeklyStats: WeekStat[] = weekly.map((r) => ({
    week: formatWeek(r.week),
    tasks: Number(r.tasks),
    done: Number(r.done),
    plannedHours: Number(r.planned_hours),
    doneHours: Number(r.done_hours),
  }));

  const complexityStats: ComplexityStat[] = byComplexity.map((r) => ({
    complexity: r.complexity,
    tasks: Number(r.tasks),
    completionRate: Number(r.tasks) ? Number(r.done) / Number(r.tasks) : 0,
    measured: Number(r.measured),
    estimateRatio: r.ratio === null ? null : Math.round(r.ratio * 100) / 100,
  }));

  const totals = weeklyStats.reduce((s, w) => ({ tasks: s.tasks + w.tasks, done: s.done + w.done }), { tasks: 0, done: 0 });
  return {
    range: { from: formatWeek(from), to: formatWeek(to) },
    completionRate: totals.tasks ? totals.done / totals.tasks : 0,
    weekly: weeklyStats,
    byComplexity: complexityStats,
  };
}
