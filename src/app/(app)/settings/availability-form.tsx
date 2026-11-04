"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { api } from "@/lib/api-client";
import { DAYS } from "@/lib/week";

export function AvailabilityForm({ initial }: { initial: number[] }) {
  const router = useRouter();
  const [hours, setHours] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const total = hours.reduce((s, h) => s + h, 0);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      await api("/api/me", "PATCH", { availability: hours });
      setStatus("saved");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={save} className="mt-8">
      <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
        {DAYS.map((day, i) => (
          <li key={day} className="flex items-center gap-4 px-4 py-3">
            <label htmlFor={`h-${i}`} className="w-28 font-bold">
              {day}
            </label>
            <input
              id={`h-${i}`}
              type="range"
              min={0}
              max={12}
              value={hours[i]}
              onChange={(e) => {
                const next = [...hours];
                next[i] = Number(e.target.value);
                setHours(next);
                setStatus("idle");
              }}
              className="flex-1 accent-[var(--brand)]"
            />
            <output htmlFor={`h-${i}`} className="w-10 text-right tabular-nums">
              {hours[i]}h
            </output>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center gap-3">
        <span className="text-muted">{total} hours a week</span>
        <span role="status" className="ml-auto text-sm text-muted">
          {status === "saved" && "Saved."}
          {status === "error" && "Couldn't save. Try again."}
        </span>
        <Button variant="primary" type="submit" disabled={status === "saving"}>
          Save hours
        </Button>
      </div>
    </form>
  );
}
