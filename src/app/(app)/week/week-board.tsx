"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { Button, Pips } from "@/components/ui";
import { api } from "@/lib/api-client";
import { DAY_SHORT, DAYS, addWeeks, dayDate, parseWeek, formatWeek } from "@/lib/week";
import { PlanDialog } from "./plan-dialog";
import { TaskDialog } from "./task-dialog";
import type { BoardTask } from "./types";

type Props = {
  week: string;
  isCurrentWeek: boolean;
  firstOpenDay: number;
  availability: number[];
  tasks: BoardTask[];
};

const monthDay = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" });
const dayOfMonth = new Intl.DateTimeFormat("en", { day: "numeric", timeZone: "UTC" });

function weekLabel(weekStart: Date) {
  const end = dayDate(weekStart, 6);
  return `${monthDay.format(weekStart)} – ${monthDay.format(end)}, ${end.getUTCFullYear()}`;
}

export function WeekBoard({ week, isCurrentWeek, firstOpenDay, availability, tasks: serverTasks }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  // Ticking a task updates the screen immediately; the server copy replaces it after the refresh.
  const [tasks, setOptimisticDone] = useOptimistic(serverTasks, (state, change: { id: string; done: boolean }) =>
    state.map((t) => (t.id === change.id ? { ...t, done: change.done } : t)),
  );
  const [editing, setEditing] = useState<{ task?: BoardTask; day: number | null } | null>(null);
  const [planning, setPlanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weekStart = parseWeek(week)!;
  const done = tasks.filter((t) => t.done).length;
  const plannedHours = tasks.reduce((s, t) => s + t.hours, 0);
  const openTasks = tasks.filter((t) => !t.done).length;
  const unscheduled = tasks.filter((t) => t.day === null);

  const refresh = () => startTransition(() => router.refresh());

  function toggleDone(task: BoardTask) {
    setError(null);
    startTransition(async () => {
      setOptimisticDone({ id: task.id, done: !task.done });
      try {
        await api(`/api/tasks/${task.id}`, "PATCH", { done: !task.done });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't update the task.");
      }
    });
  }

  const weekHref = (offset: number) => `/week?week=${formatWeek(addWeeks(weekStart, offset))}`;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{weekLabel(weekStart)}</h1>
          <p className="mt-2 text-muted">
            {tasks.length === 0
              ? "Nothing planned yet."
              : `${done} of ${tasks.length} tasks done, ${plannedHours} hours planned.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-line bg-surface text-sm font-bold">
            <Link href={weekHref(-1)} className="px-3 py-2 hover:bg-paper" aria-label="Previous week">
              Previous
            </Link>
            {!isCurrentWeek && (
              <Link href="/week" className="border-l border-line px-3 py-2 hover:bg-paper">
                This week
              </Link>
            )}
            <Link href={weekHref(1)} className="border-l border-line px-3 py-2 hover:bg-paper" aria-label="Next week">
              Next
            </Link>
          </div>
          <Button onClick={() => setPlanning(true)} disabled={openTasks === 0 || firstOpenDay > 6}>
            Plan my week
          </Button>
          <Button variant="primary" onClick={() => setEditing({ day: null })}>
            Add task
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-hard-soft px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {DAYS.map((name, day) => (
          <DayColumn
            key={day}
            name={name}
            short={DAY_SHORT[day]}
            date={dayOfMonth.format(dayDate(weekStart, day))}
            capacity={availability[day] ?? 0}
            past={day < firstOpenDay}
            tasks={tasks.filter((t) => t.day === day)}
            onAdd={() => setEditing({ day })}
            onOpen={(task) => setEditing({ task, day: task.day })}
            onToggle={toggleDone}
          />
        ))}
      </div>

      <section className="mt-10" aria-labelledby="unscheduled-heading">
        <h2 id="unscheduled-heading" className="font-display text-2xl font-bold tracking-tight">
          Not scheduled yet
        </h2>
        {unscheduled.length === 0 ? (
          <p className="mt-2 text-muted">Every task has a day.</p>
        ) : (
          <>
            <p className="mt-1 text-muted">Give these a day yourself, or let Plan my week find room for them.</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {unscheduled.map((task) => (
                <li key={task.id}>
                  <TaskCard task={task} onOpen={() => setEditing({ task, day: null })} onToggle={() => toggleDone(task)} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {editing && (
        <TaskDialog
          week={week}
          task={editing.task}
          initialDay={editing.day}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh();
          }}
        />
      )}
      {planning && (
        <PlanDialog
          week={week}
          tasks={tasks}
          availability={availability}
          onClose={() => setPlanning(false)}
          onApplied={() => {
            setPlanning(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}

type DayProps = {
  name: string;
  short: string;
  date: string;
  capacity: number;
  past: boolean;
  tasks: BoardTask[];
  onAdd: () => void;
  onOpen: (task: BoardTask) => void;
  onToggle: (task: BoardTask) => void;
};

/**
 * One day of the week. The body is ruled with one line per available hour and each task is
 * as tall as its estimate, so a full or overbooked day is visible at a glance.
 */
function DayColumn({ name, short, date, capacity, past, tasks, onAdd, onOpen, onToggle }: DayProps) {
  const planned = tasks.reduce((s, t) => s + t.hours, 0);
  const over = planned > capacity;
  const rows = Math.max(capacity, planned, 1);

  return (
    <section aria-label={`${name}, ${planned} of ${capacity} hours planned`} className={`flex flex-col rounded-xl border border-line bg-surface ${past ? "opacity-60" : ""}`}>
      <header className="flex items-baseline justify-between gap-2 border-b border-line px-3 py-2.5">
        <h2 className="font-display text-lg font-bold">
          <span className="lg:hidden">{name}</span>
          <span className="hidden lg:inline">{short}</span> <span className="font-normal text-muted">{date}</span>
        </h2>
        <span className={`text-sm tabular-nums ${over ? "font-bold text-hard" : "text-muted"}`}>
          {planned}/{capacity}h
        </span>
      </header>

      <div className="relative hour-ruled p-1.5" style={{ minHeight: `calc(${rows} * var(--hour) + 0.75rem)` }}>
        {over && (
          <div
            aria-hidden
            className="overflow-hatch absolute inset-x-0 bottom-0 border-t-2 border-dashed border-hard"
            style={{ top: `calc(${capacity} * var(--hour) + 0.375rem)` }}
          />
        )}
        <ul className="relative flex flex-col">
          {tasks.map((task) => (
            <li key={task.id} style={{ height: `calc(${task.hours} * var(--hour))` }} className="p-0.5">
              <TaskCard task={task} fill onOpen={() => onOpen(task)} onToggle={() => onToggle(task)} />
            </li>
          ))}
        </ul>
      </div>

      {!past && (
        <button onClick={onAdd} className="border-t border-line px-3 py-2 text-left text-sm font-bold text-muted hover:text-ink">
          Add to {name}
        </button>
      )}
    </section>
  );
}

function TaskCard({ task, fill, onOpen, onToggle }: { task: BoardTask; fill?: boolean; onOpen: () => void; onToggle: () => void }) {
  // A one-hour card in a day column only has room for one line; taller cards let the title wrap.
  const compact = fill && task.hours < 2;
  const meta = (
    <>
      <Pips value={task.complexity} />
      <span className="tabular-nums">
        {task.hours}h{task.done && task.actualHours !== null && `, took ${task.actualHours}h`}
      </span>
    </>
  );

  return (
    <div
      className={`flex h-full flex-col gap-1 overflow-hidden rounded-lg border px-2.5 py-1.5 ${
        task.done ? "border-done/40 bg-done-soft" : task.complexity >= 4 ? "border-hard/60 bg-surface" : "border-line bg-surface"
      } ${fill ? "" : "min-h-11"}`}
    >
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={task.done}
          onChange={onToggle}
          aria-label={task.done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--done)]"
        />
        <button
          onClick={onOpen}
          title={task.title}
          className={`min-w-0 flex-1 text-left text-sm leading-snug font-bold ${compact ? "truncate" : "line-clamp-3 break-words"} ${task.done ? "text-muted line-through" : ""}`}
        >
          {task.title}
        </button>
        {compact && <span className="shrink-0 text-xs tabular-nums text-muted">{task.hours}h</span>}
      </div>
      {!compact && <div className="flex flex-wrap items-center gap-x-2 pl-6 text-xs text-muted">{meta}</div>}
    </div>
  );
}
