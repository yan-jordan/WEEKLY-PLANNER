/**
 * Compares the rule-based planner with the LLM planner on fixed scenarios.
 *
 *   npm run eval:planner            # rule-based only
 *   LLM_API_KEY=... npm run eval:planner   # both, side by side
 *
 * For each scenario it reports hard-constraint violations, how many hours got scheduled,
 * how evenly the load is spread (imbalance, lower is better) and the peak daily complexity.
 */
import "dotenv/config";
import { evaluatePlan, greedyPlan, type PlanInput } from "../src/lib/planner";
import { llmConfigFromEnv, llmPlan } from "../src/lib/planner/llm";

const t = (id: string, title: string, hours: number, complexity: number) => ({ id, title, hours, complexity });

const scenarios: Record<string, PlanInput> = {
  "light week": {
    availability: [4, 4, 4, 4, 4, 2, 2],
    fromDay: 0,
    tasks: [t("1", "Lecture notes", 1, 2), t("2", "Gym", 1, 1), t("3", "Read paper", 2, 3), t("4", "Email TA", 1, 1)],
  },
  "exam week (tight)": {
    availability: [5, 5, 5, 5, 3, 2, 2],
    fromDay: 0,
    tasks: [
      t("1", "Study OS", 5, 5), t("2", "Study algorithms", 5, 5), t("3", "OS project", 4, 4),
      t("4", "Algorithms HW", 3, 4), t("5", "Laundry", 1, 1), t("6", "Mock exam", 3, 4), t("7", "Groceries", 1, 1),
    ],
  },
  "overbooked": {
    availability: [3, 3, 3, 3, 3, 0, 0],
    fromDay: 0,
    tasks: [t("1", "Thesis", 3, 5), t("2", "Paper review", 3, 4), t("3", "Slides", 3, 3), t("4", "Report", 3, 3), t("5", "Code review", 3, 3), t("6", "Extra", 3, 2)],
  },
  "mid-week start": {
    availability: [4, 4, 4, 4, 4, 4, 4],
    fromDay: 3,
    tasks: [t("1", "Deploy", 2, 4), t("2", "Write tests", 3, 3), t("3", "Docs", 2, 2), t("4", "Refactor", 4, 4), t("5", "Standup prep", 1, 1)],
  },
};

type Row = { scenario: string; planner: string; violations: number; scheduled: string; imbalance: number; peakComplexity: number };

async function main() {
  const llm = llmConfigFromEnv();
  const rows: Row[] = [];

  for (const [name, input] of Object.entries(scenarios)) {
    const runs: [string, () => Promise<ReturnType<typeof greedyPlan>>][] = [["rules", async () => greedyPlan(input)]];
    if (llm) runs.push([`llm (${llm.model})`, async () => (await llmPlan(input, llm)).assignments]);

    for (const [planner, run] of runs) {
      try {
        const m = evaluatePlan(input, await run());
        rows.push({
          scenario: name,
          planner,
          violations: m.violations.length,
          scheduled: `${m.scheduledHours}/${m.totalHours}h`,
          imbalance: m.imbalance,
          peakComplexity: m.peakComplexity,
        });
      } catch (err) {
        rows.push({ scenario: name, planner, violations: -1, scheduled: `error: ${(err as Error).message}`, imbalance: NaN, peakComplexity: NaN });
      }
    }
  }

  console.table(rows);
  if (!llm) console.log("Set LLM_BASE_URL, LLM_API_KEY and LLM_MODEL to compare against an LLM.");
}

main();
