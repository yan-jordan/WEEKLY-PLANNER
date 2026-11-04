"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/modal";
import { Button, Pips } from "@/components/ui";
import { api } from "@/lib/api-client";
import { DAYS } from "@/lib/week";
import type { BoardTask } from "./types";

type Plan = {
  assignments: { taskId: string; day: number | null }[];
  source: "llm" | "rules" | "fallback";
  summary: string;
  fromDay: number;
  mode: Mode;
};

type Mode = "fill" | "rebalance";

const SOURCE_NOTE: Record<Plan["source"], string> = {
  llm: "Planned by the AI assistant and checked against your available hours.",
  rules: "Planned by the built-in scheduler.",
  fallback: "The AI plan didn't fit your hours, so the built-in scheduler made this one.",
};

type Props = { week: string; tasks: BoardTask[]; availability: number[]; onClose: () => void; onApplied: () => void };

export function PlanDialog({ week, tasks, availability, onClose, onApplied }: Props) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [mode, setMode] = useState<Mode>("fill");

  useEffect(() => {
    let cancelled = false;
    api<{ plan: Plan }>("/api/plan", "POST", { week, mode })
      .then((res) => !cancelled && setPlan(res.plan))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Couldn't make a plan."));
    return () => {
      cancelled = true;
    };
  }, [week, mode]);

  const byId = new Map(tasks.map((t) => [t.id, t]));
  const proposed = new Map(plan?.assignments.map((a) => [a.taskId, a.day]) ?? []);
  const changes = plan?.assignments.filter((a) => byId.get(a.taskId)?.day !== a.day).length ?? 0;
  // Where every unfinished task ends up if the plan is applied: proposed day, or where it already is.
  const finalDay = (t: BoardTask) => (proposed.has(t.id) ? proposed.get(t.id)! : t.day);
  const open = tasks.filter((t) => !t.done);

  async function apply() {
    if (!plan) return;
    setApplying(true);
    try {
      await api("/api/plan/apply", "POST", { week, assignments: plan.assignments });
      onApplied();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the plan.");
      setApplying(false);
    }
  }

  return (
    <Modal title="Plan my week" onClose={onClose} wide>
      <div role="radiogroup" aria-label="What to plan" className="mb-5 grid grid-cols-2 overflow-hidden rounded-lg border border-line text-sm">
        {(
          [
            ["fill", "Fit in new tasks", "Keep what you've scheduled"],
            ["rebalance", "Rebalance the week", "Re-plan every open task"],
          ] as const
        ).map(([value, label, hint]) => (
          <button
            key={value}
            role="radio"
            aria-checked={mode === value}
            onClick={() => {
              if (mode === value) return;
              setPlan(null);
              setError(null);
              setMode(value);
            }}
            className={`px-3 py-2 text-left not-first:border-l not-first:border-line ${mode === value ? "bg-ink text-surface" : "hover:bg-paper"}`}
          >
            <span className="block font-bold">{label}</span>
            <span className={mode === value ? "opacity-80" : "text-muted"}>{hint}</span>
          </button>
        ))}
      </div>
      {!plan && !error && <p className="text-muted">Working out where everything fits…</p>}
      {error && (
        <p role="alert" className="rounded-lg bg-hard-soft px-3 py-2 text-sm">
          {error}
        </p>
      )}
      {plan && (
        <>
          <p className="text-lg">{plan.summary}</p>
          <p className="mt-1 text-sm text-muted">{SOURCE_NOTE[plan.source]}</p>

          <ol className="mt-6 flex flex-col gap-4">
            {[...DAYS.map((_, d) => d), null].map((day) => {
              const dayTasks = open.filter((t) => finalDay(t) === day);
              if (day !== null && day < plan.fromDay) return null;
              if (dayTasks.length === 0 && day === null) return null;
              const hours = dayTasks.reduce((s, t) => s + t.hours, 0);
              return (
                <li key={day ?? "none"}>
                  <div className="flex items-baseline justify-between border-b border-line pb-1">
                    <h3 className="font-display font-bold">{day === null ? "Doesn't fit this week" : DAYS[day]}</h3>
                    {day !== null && (
                      <span className="text-sm tabular-nums text-muted">
                        {hours}/{availability[day]}h
                      </span>
                    )}
                  </div>
                  {dayTasks.length === 0 ? (
                    <p className="py-1.5 text-sm text-muted">Free</p>
                  ) : (
                    <ul>
                      {dayTasks.map((t) => {
                        const moved = t.day !== finalDay(t);
                        return (
                          <li key={t.id} className="flex items-center gap-3 py-1.5 text-sm">
                            <span className="min-w-0 flex-1 truncate font-bold">{t.title}</span>
                            <Pips value={t.complexity} />
                            <span className="w-8 text-right tabular-nums text-muted">{t.hours}h</span>
                            <span className={`w-28 text-right text-xs ${moved ? "font-bold text-brand" : "text-muted"}`}>
                              {moved ? (t.day === null ? "newly scheduled" : `moved from ${DAYS[t.day].slice(0, 3)}`) : "unchanged"}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">{changes === 0 ? "Nothing to change." : changes === 1 ? "1 task will move." : `${changes} tasks will move.`}</span>
            <Button className="ml-auto" onClick={onClose}>
              Keep current plan
            </Button>
            <Button variant="primary" onClick={apply} disabled={applying || changes === 0}>
              {applying ? "Applying…" : "Apply plan"}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
