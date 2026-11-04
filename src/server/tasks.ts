import { db } from "@/lib/db";
import { notFound } from "@/lib/http";
import type { CreateTaskInput, UpdateTaskInput } from "@/lib/validation";
import { currentWeek } from "@/lib/week";

export type TaskDTO = Awaited<ReturnType<typeof listTasks>>[number];

const taskSelect = {
  id: true,
  title: true,
  hours: true,
  complexity: true,
  weekStart: true,
  day: true,
  done: true,
  actualHours: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** All of a user's tasks for one week, scheduled ones by day, then unscheduled ones. */
export function listTasks(userId: string, weekStart: Date = currentWeek()) {
  return db.task.findMany({
    where: { userId, weekStart },
    select: taskSelect,
    orderBy: [{ day: { sort: "asc", nulls: "last" } }, { done: "asc" }, { createdAt: "asc" }],
  });
}

export function createTask(userId: string, input: CreateTaskInput) {
  return db.task.create({
    data: {
      userId,
      title: input.title,
      hours: input.hours,
      complexity: input.complexity,
      weekStart: input.week ?? currentWeek(),
      day: input.day ?? null,
    },
    select: taskSelect,
  });
}

/**
 * Updates a task only if it belongs to `userId`. Someone else's task id behaves exactly
 * like a missing one (404), so ids can't be probed across accounts.
 */
export async function updateTask(userId: string, taskId: string, input: UpdateTaskInput) {
  const existing = await db.task.findFirst({ where: { id: taskId, userId }, select: { done: true } });
  if (!existing) throw notFound("Task");

  const completing = input.done === true && !existing.done;
  const reopening = input.done === false && existing.done;

  return db.task.update({
    where: { id: taskId, userId },
    data: {
      ...input,
      ...(completing && { completedAt: new Date() }),
      ...(reopening && { completedAt: null, actualHours: null }),
    },
    select: taskSelect,
  });
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const { count } = await db.task.deleteMany({ where: { id: taskId, userId } });
  if (count === 0) throw notFound("Task");
}

/**
 * Moves many tasks to new days in one transaction (used when applying a generated plan).
 * Every task must belong to the user and to the given week, otherwise nothing is changed.
 */
export async function assignDays(
  userId: string,
  weekStart: Date,
  assignments: { taskId: string; day: number | null }[],
): Promise<void> {
  const ids = [...new Set(assignments.map((a) => a.taskId))];
  await db.$transaction(async (tx) => {
    const owned = await tx.task.count({ where: { id: { in: ids }, userId, weekStart } });
    if (owned !== ids.length) throw notFound("Task");
    for (const a of assignments) {
      await tx.task.update({ where: { id: a.taskId }, data: { day: a.day } });
    }
  });
}
