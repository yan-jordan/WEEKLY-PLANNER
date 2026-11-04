import type { Metadata } from "next";
import { requireCurrentUserId } from "@/lib/auth/current-user";
import { currentWeek, formatWeek, parseWeek } from "@/lib/week";
import { firstOpenDay } from "@/server/plan";
import { listTasks } from "@/server/tasks";
import { getAvailability } from "@/server/users";
import { WeekBoard } from "./week-board";

export const metadata: Metadata = { title: "Week" };

export default async function WeekPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const userId = await requireCurrentUserId();
  const { week: weekParam } = await searchParams;
  const week = (weekParam && parseWeek(weekParam)) || currentWeek();

  const [tasks, availability] = await Promise.all([listTasks(userId, week), getAvailability(userId)]);

  return (
    <WeekBoard
      week={formatWeek(week)}
      isCurrentWeek={formatWeek(week) === formatWeek(currentWeek())}
      firstOpenDay={firstOpenDay(week)}
      availability={availability}
      tasks={tasks.map((t) => ({ id: t.id, title: t.title, hours: t.hours, complexity: t.complexity, day: t.day, done: t.done, actualHours: t.actualHours }))}
    />
  );
}
