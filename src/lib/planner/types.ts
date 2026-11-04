export type PlannerTask = {
  id: string;
  title: string;
  hours: number;
  complexity: number;
};

export type PlanInput = {
  tasks: PlannerTask[];
  /** Hours available per day, Monday first. */
  availability: number[];
  /** First day that can still be used (0 = Monday). Earlier days are in the past. */
  fromDay: number;
};

export type Assignment = { taskId: string; day: number | null };

export type Plan = {
  assignments: Assignment[];
  /** Which strategy produced the plan. "fallback" = LLM was tried but its plan was rejected. */
  source: "llm" | "rules" | "fallback";
  summary: string;
};
