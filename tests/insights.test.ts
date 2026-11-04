import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { parseWeek } from "@/lib/week";
import { getInsights } from "@/server/insights";
import { resetDb } from "./helpers";

beforeEach(resetDb);
afterAll(() => db.$disconnect());

describe("getInsights", () => {
  it("aggregates completion per week (including empty weeks) and estimate accuracy per complexity", async () => {
    const user = await db.user.create({ data: { email: "a@example.com", passwordHash: "x" } });
    const other = await db.user.create({ data: { email: "b@example.com", passwordHash: "x" } });
    const thisWeek = parseWeek("2026-11-02")!;
    const lastWeek = parseWeek("2026-10-26")!;
    const base = { userId: user.id, title: "t" };

    await db.task.createMany({
      data: [
        { ...base, weekStart: thisWeek, hours: 2, complexity: 3, done: true, actualHours: 3 }, // ratio 1.5
        { ...base, weekStart: thisWeek, hours: 4, complexity: 3, done: true, actualHours: 4 }, // ratio 1.0
        { ...base, weekStart: thisWeek, hours: 1, complexity: 1, done: false },
        { ...base, weekStart: lastWeek, hours: 2, complexity: 1, done: true },
        { userId: other.id, title: "not mine", weekStart: thisWeek, hours: 5, complexity: 5, done: true },
      ],
    });

    const insights = await getInsights(user.id, 3, new Date("2026-11-04T12:00:00Z"));

    expect(insights.weekly).toEqual([
      { week: "2026-10-19", tasks: 0, done: 0, plannedHours: 0, doneHours: 0 },
      { week: "2026-10-26", tasks: 1, done: 1, plannedHours: 2, doneHours: 2 },
      { week: "2026-11-02", tasks: 3, done: 2, plannedHours: 7, doneHours: 6 },
    ]);
    expect(insights.completionRate).toBe(0.75);
    expect(insights.byComplexity).toEqual([
      { complexity: 1, tasks: 2, completionRate: 0.5, measured: 0, estimateRatio: null },
      { complexity: 3, tasks: 2, completionRate: 1, measured: 2, estimateRatio: 1.25 },
    ]);
  });
});
