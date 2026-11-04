import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/current-user";

/** A static sample week for the landing page, drawn the same way as the real board. */
const SAMPLE = [
  { day: "Mon", capacity: 4, tasks: [{ t: "Thesis chapter", h: 3, hard: true }, { t: "Gym", h: 1 }] },
  { day: "Tue", capacity: 4, tasks: [{ t: "Algorithms HW", h: 3, hard: true }] },
  { day: "Wed", capacity: 4, tasks: [{ t: "Read paper", h: 2 }, { t: "Groceries", h: 1 }] },
  { day: "Thu", capacity: 4, tasks: [{ t: "Slides", h: 2 }, { t: "Lab report", h: 2 }] },
  { day: "Fri", capacity: 4, tasks: [{ t: "Mock exam", h: 3, hard: true }] },
  { day: "Sat", capacity: 2, tasks: [{ t: "Laundry", h: 1 }] },
  { day: "Sun", capacity: 2, tasks: [] },
];

export default async function Home() {
  if (await getCurrentUserId()) redirect("/week");

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 py-6 sm:px-6">
      <nav className="flex items-center justify-between">
        <span className="font-display text-xl font-bold tracking-tight">Chinesh</span>
        <Link href="/login" className="text-sm font-bold underline-offset-4 hover:underline">
          Log in
        </Link>
      </nav>

      <section className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1fr_1.3fr]">
        <div className="max-w-md">
          <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl">Plan the week you actually have.</h1>
          <p className="mt-6 text-lg text-muted">
            Tell Chinesh how many hours each day really has. Add your tasks with a time estimate and how hard they are, and it
            finds a place for each one without overbooking a day.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-lg bg-brand px-5 py-3 font-bold text-brand-ink hover:brightness-110">
              Create a free account
            </Link>
            <Link href="/login" className="rounded-lg border border-line bg-surface px-5 py-3 font-bold hover:border-muted">
              Log in
            </Link>
          </div>
        </div>

        <figure aria-label="Example week: tasks sized by their hours inside each day's available time" className="overflow-x-auto">
          <div className="grid min-w-[36rem] grid-cols-7 gap-1.5">
            {SAMPLE.map((d) => (
              <div key={d.day} className="rounded-lg border border-line bg-surface">
                <div className="border-b border-line px-2 py-1.5 font-display text-sm font-bold">{d.day}</div>
                <div className="hour-ruled p-1 [--hour:2.25rem]" style={{ minHeight: `calc(4 * var(--hour) + 0.5rem)` }}>
                  {d.tasks.map((task) => (
                    <div key={task.t} className="p-0.5" style={{ height: `calc(${task.h} * var(--hour))` }}>
                      <div className={`h-full rounded-md border bg-surface px-1.5 py-1 text-xs font-bold leading-tight ${task.hard ? "border-hard/60" : "border-line"}`}>
                        {task.t}
                      </div>
                    </div>
                  ))}
                  {d.capacity < 4 && (
                    <div aria-hidden className="mx-0.5 rounded-md bg-paper" style={{ height: `calc(${4 - d.capacity} * var(--hour))`, marginTop: `calc(${d.capacity - d.tasks.reduce((s, t) => s + t.h, 0)} * var(--hour))` }} />
                  )}
                </div>
              </div>
            ))}
          </div>
          <figcaption className="mt-3 text-sm text-muted">Each line is one available hour. Hard tasks go early in the week.</figcaption>
        </figure>
      </section>
    </main>
  );
}
