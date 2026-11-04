import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/session";
import { route } from "@/lib/http";
import { createTaskSchema, listTasksQuery } from "@/lib/validation";
import { createTask, listTasks } from "@/server/tasks";

/** GET /api/tasks?week=YYYY-MM-DD — the current user's tasks for a week (defaults to this week). */
export const GET = route(async (req: Request) => {
  const userId = await requireUserId(req);
  const { week } = listTasksQuery.parse(Object.fromEntries(new URL(req.url).searchParams));
  return NextResponse.json({ tasks: await listTasks(userId, week) });
});

/** POST /api/tasks — create a task. */
export const POST = route(async (req: Request) => {
  const userId = await requireUserId(req);
  const input = createTaskSchema.parse(await req.json());
  return NextResponse.json({ task: await createTask(userId, input) }, { status: 201 });
});
