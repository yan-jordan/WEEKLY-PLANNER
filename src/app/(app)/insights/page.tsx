import type { Metadata } from "next";
import { requireCurrentUserId } from "@/lib/auth/current-user";
import { parseWeek } from "@/lib/week";
import { getInsights } from "@/server/insights";

export const metadata: Metadata = { title: "Insights" };

const short = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" });
const pct = (n: number) => `${Math.round(n * 100)}%`;

function estimateNote(ratio: number | null) {
  if (ratio === null) return "No actual times recorded yet";
  if (ratio >= 1.15) return `Takes ${Math.round((ratio - 1) * 100)}% longer than you estimate`;
  if (ratio <= 0.85) return `Takes ${Math.round((1 - ratio) * 100)}% less time than you estimate`;
  return "Your estimates are about right";
}

export default async function InsightsPage() {
  const insights = await getInsights(await requireCurrentUserId(), 8);
  const maxHours = Math.max(1, ...insights.weekly.map((w) => w.plannedHours));
  const hasData = insights.weekly.some((w) => w.tasks > 0);

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-4xl font-bold tracking-tight">The last 8 weeks</h1>
      {!hasData ? (
        <p className="mt-3 text-muted">Insights appear once you&apos;ve planned and finished a few tasks.</p>
      ) : (
        <>
          <p className="mt-2 text-lg">
            You finished <strong>{pct(insights.completionRate)}</strong> of what you planned.
          </p>

          <section className="mt-10" aria-labelledby="hours-heading">
            <h2 id="hours-heading" className="font-display text-2xl font-bold">
              Planned and finished hours
            </h2>
            <div className="mt-2 flex gap-5 text-sm text-muted">
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-line" /> Planned</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-done" /> Finished</span>
            </div>
            <ol className="mt-4 flex h-56 items-end gap-2 sm:gap-4">
              {insights.weekly.map((w) => (
                <li key={w.week} className="flex h-full flex-1 flex-col items-center justify-end gap-2" aria-label={`Week of ${w.week}: ${w.doneHours} of ${w.plannedHours} hours finished`}>
                  <span className="text-xs tabular-nums text-muted">{w.plannedHours ? `${w.doneHours}/${w.plannedHours}` : ""}</span>
                  <div className="relative w-full max-w-12 rounded-t-md bg-line" style={{ height: `${(w.plannedHours / maxHours) * 100}%` }}>
                    <div className="absolute inset-x-0 bottom-0 rounded-t-md bg-done" style={{ height: w.plannedHours ? `${(w.doneHours / w.plannedHours) * 100}%` : 0 }} />
                  </div>
                  <span className="text-xs text-muted">{short.format(parseWeek(w.week)!)}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-12" aria-labelledby="estimate-heading">
            <h2 id="estimate-heading" className="font-display text-2xl font-bold">
              How accurate are your estimates?
            </h2>
            <p className="mt-1 text-muted">Record how long a finished task really took (open it from the week view) to fill this in.</p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line text-muted">
                  <tr>
                    <th className="px-4 py-3 font-bold">Complexity</th>
                    <th className="px-4 py-3 text-right font-bold">Tasks</th>
                    <th className="px-4 py-3 text-right font-bold">Finished</th>
                    <th className="px-4 py-3 text-right font-bold">Actual ÷ estimate</th>
                    <th className="px-4 py-3 font-bold">Takeaway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {insights.byComplexity.map((c) => (
                    <tr key={c.complexity}>
                      <td className="px-4 py-3 font-bold">{c.complexity} of 5</td>
                      <td className="px-4 py-3 text-right tabular-nums">{c.tasks}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{pct(c.completionRate)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{c.estimateRatio === null ? "–" : `${c.estimateRatio.toFixed(2)}×`}</td>
                      <td className="px-4 py-3 text-muted">{estimateNote(c.estimateRatio)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
