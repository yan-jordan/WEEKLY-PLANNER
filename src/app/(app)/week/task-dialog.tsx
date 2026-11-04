"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { Button, Field } from "@/components/ui";
import { api, ClientApiError } from "@/lib/api-client";
import { DAYS } from "@/lib/week";
import type { BoardTask } from "./types";

const COMPLEXITY = ["Trivial", "Easy", "Medium", "Hard", "Very hard"];

type Props = {
  week: string;
  task?: BoardTask;
  initialDay: number | null;
  onClose: () => void;
  onSaved: () => void;
};

export function TaskDialog({ week, task, initialDay, onClose, onSaved }: Props) {
  const [complexity, setComplexity] = useState(task?.complexity ?? 3);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function run(action: () => Promise<unknown>) {
    setPending(true);
    setError(null);
    setFields({});
    try {
      await action();
      onSaved();
    } catch (err) {
      if (err instanceof ClientApiError) {
        setFields(err.fields);
        setError(err.message);
      } else setError("Couldn't reach the server. Try again.");
      setPending(false);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const dayValue = String(form.get("day"));
    const body: Record<string, unknown> = {
      title: String(form.get("title")),
      hours: Number(form.get("hours")),
      complexity,
      day: dayValue === "" ? null : Number(dayValue),
    };
    if (task?.done) {
      const actual = String(form.get("actualHours") ?? "");
      body.actualHours = actual === "" ? null : Number(actual);
    }
    run(() => (task ? api(`/api/tasks/${task.id}`, "PATCH", body) : api("/api/tasks", "POST", { ...body, week })));
  }

  return (
    <Modal title={task ? "Edit task" : "Add task"} onClose={onClose}>
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <Field label="Title" name="title" defaultValue={task?.title} required maxLength={120} autoFocus error={fields.title} />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Estimated hours" name="hours" type="number" min={1} max={12} defaultValue={task?.hours ?? 1} required error={fields.hours} />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold">Day</span>
            <select name="day" defaultValue={initialDay ?? ""} className="min-h-11 rounded-lg border border-line bg-surface px-3 text-base">
              <option value="">Not scheduled</option>
              {DAYS.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-bold">How hard is it?</legend>
          <div className="grid grid-cols-5 overflow-hidden rounded-lg border border-line">
            {COMPLEXITY.map((label, i) => {
              const value = i + 1;
              return (
                <label key={value} className={`cursor-pointer border-line px-1 py-2 text-center text-xs not-first:border-l has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand ${complexity === value ? "bg-ink font-bold text-surface" : "hover:bg-paper"}`}>
                  <input type="radio" name="complexity" value={value} checked={complexity === value} onChange={() => setComplexity(value)} className="sr-only" />
                  <span className="block font-display text-base">{value}</span>
                  {label}
                </label>
              );
            })}
          </div>
        </fieldset>

        {task?.done && (
          <Field
            label="How long did it actually take? (hours, optional)"
            name="actualHours"
            type="number"
            min={1}
            max={24}
            defaultValue={task.actualHours ?? ""}
            error={fields.actualHours}
          />
        )}

        {error && !Object.keys(fields).length && (
          <p role="alert" className="rounded-lg bg-hard-soft px-3 py-2 text-sm">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {task && (
            <Button type="button" variant="danger" disabled={pending} onClick={() => run(() => api(`/api/tasks/${task.id}`, "DELETE"))}>
              Delete task
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={pending} className="ml-auto">
            {task ? "Save changes" : "Add task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
