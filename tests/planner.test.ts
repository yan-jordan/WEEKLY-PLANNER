import { describe, expect, it, vi } from "vitest";
import { evaluatePlan, greedyPlan, type PlanInput } from "@/lib/planner";
import { makePlan } from "@/lib/planner";
import { llmPlan } from "@/lib/planner/llm";

const input: PlanInput = {
  availability: [4, 4, 4, 4, 4, 2, 0],
  fromDay: 0,
  tasks: [
    { id: "a", title: "Thesis chapter", hours: 3, complexity: 5 },
    { id: "b", title: "Algorithms HW", hours: 3, complexity: 4 },
    { id: "c", title: "Groceries", hours: 1, complexity: 1 },
    { id: "d", title: "Gym", hours: 1, complexity: 2 },
    { id: "e", title: "Read paper", hours: 2, complexity: 3 },
  ],
};

const config = { baseUrl: "https://llm.test/v1", apiKey: "k", model: "m" };

function fakeFetch(content: string, status = 200) {
  return vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status }));
}

describe("greedyPlan", () => {
  it("produces a plan with no hard-constraint violations", () => {
    const metrics = evaluatePlan(input, greedyPlan(input));
    expect(metrics.violations).toEqual([]);
    expect(metrics.unscheduledTasks).toBe(0);
  });

  it("does not put the two hardest tasks on the same day", () => {
    const plan = greedyPlan(input);
    const day = (id: string) => plan.find((a) => a.taskId === id)!.day;
    expect(day("a")).not.toBe(day("b"));
  });

  it("never schedules into the past and leaves tasks unscheduled when nothing fits", () => {
    const late = { ...input, fromDay: 5 }; // only Saturday (2h) and Sunday (0h) left
    const plan = greedyPlan(late);
    const metrics = evaluatePlan(late, plan);
    expect(metrics.violations).toEqual([]);
    expect(plan.every((a) => a.day === null || a.day >= 5)).toBe(true);
    expect(metrics.unscheduledTasks).toBeGreaterThan(0);
  });

  it("is deterministic", () => {
    expect(greedyPlan(input)).toEqual(greedyPlan(input));
  });
});

describe("evaluatePlan", () => {
  it("flags overbooked days, past days, duplicates and missing tasks", () => {
    const { violations } = evaluatePlan({ ...input, fromDay: 1 }, [
      { taskId: "a", day: 0 },
      { taskId: "b", day: 1 },
      { taskId: "e", day: 1 },
      { taskId: "e", day: 2 },
      { taskId: "zzz", day: 3 },
    ]);
    expect(violations.join("\n")).toMatch(/past day/);
    expect(violations.join("\n")).toMatch(/overbooked/);
    expect(violations.join("\n")).toMatch(/assigned twice/);
    expect(violations.join("\n")).toMatch(/missing from plan/);
    expect(violations.join("\n")).toMatch(/unknown task id/);
  });
});

describe("makePlan", () => {
  const valid = JSON.stringify({
    assignments: [
      { taskId: "a", day: 0 },
      { taskId: "b", day: 1 },
      { taskId: "c", day: 2 },
      { taskId: "d", day: 2 },
      { taskId: "e", day: 3 },
    ],
    summary: "Hard work early in the week.",
  });

  it("uses the rule-based planner when no LLM is configured", async () => {
    const plan = await makePlan(input, null);
    expect(plan.source).toBe("rules");
  });

  it("accepts a valid LLM plan, including one wrapped in a code fence", async () => {
    const plan = await makePlan(input, config, fakeFetch("```json\n" + valid + "\n```"));
    expect(plan.source).toBe("llm");
    expect(plan.summary).toBe("Hard work early in the week.");
  });

  it("falls back when the LLM overbooks a day", async () => {
    const overbooked = JSON.stringify({
      assignments: ["a", "b", "c", "d", "e"].map((taskId) => ({ taskId, day: 0 })),
      summary: "Everything on Monday.",
    });
    const plan = await makePlan(input, config, fakeFetch(overbooked));
    expect(plan.source).toBe("fallback");
    expect(evaluatePlan(input, plan.assignments).violations).toEqual([]);
  });

  it("falls back on invalid JSON, wrong shape or an HTTP error", async () => {
    expect((await makePlan(input, config, fakeFetch("not json"))).source).toBe("fallback");
    expect((await makePlan(input, config, fakeFetch('{"plan": []}'))).source).toBe("fallback");
    expect((await makePlan(input, config, fakeFetch(valid, 500))).source).toBe("fallback");
  });

  it("sends the API key and asks for JSON output", async () => {
    const fetchImpl = fakeFetch(valid);
    await llmPlan(input, config, fetchImpl);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://llm.test/v1/chat/completions");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer k");
    expect(JSON.parse(init.body as string).response_format).toEqual({ type: "json_object" });
  });
});
