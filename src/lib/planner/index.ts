import { evaluatePlan } from "./evaluate";
import { greedyPlan } from "./greedy";
import { type LlmConfig, llmPlan } from "./llm";
import type { Plan, PlanInput } from "./types";

export * from "./types";
export { evaluatePlan } from "./evaluate";
export { greedyPlan } from "./greedy";

function rulesSummary(input: PlanInput, plan: Plan["assignments"]): string {
  const unscheduled = plan.filter((a) => a.day === null).length;
  return unscheduled === 0
    ? "Hardest tasks placed first, spread to keep each day under your available hours."
    : `${unscheduled} task(s) don't fit in the hours you have left this week, so they stay unscheduled.`;
}

/**
 * Produces a weekly plan. Uses the LLM when configured, but only accepts its answer
 * if it passes the same hard-constraint checks as the rule-based planner; otherwise
 * it falls back, so the user always gets a valid plan.
 */
export async function makePlan(input: PlanInput, llm: LlmConfig | null, fetchImpl?: typeof fetch): Promise<Plan> {
  const rules = (): Plan["assignments"] => greedyPlan(input);

  if (input.tasks.length === 0) {
    return { assignments: [], source: "rules", summary: "Everything is already scheduled. Use Rebalance to re-plan the whole week." };
  }

  if (llm) {
    try {
      const result = await llmPlan(input, llm, fetchImpl);
      const { violations } = evaluatePlan(input, result.assignments);
      if (violations.length === 0) return { assignments: result.assignments, source: "llm", summary: result.summary };
      console.warn("LLM plan rejected:", violations);
    } catch (err) {
      console.warn("LLM planner failed:", err instanceof Error ? err.message : err);
    }
    const assignments = rules();
    return { assignments, source: "fallback", summary: rulesSummary(input, assignments) };
  }

  const assignments = rules();
  return { assignments, source: "rules", summary: rulesSummary(input, assignments) };
}
