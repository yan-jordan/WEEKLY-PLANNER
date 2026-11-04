import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/session";
import { route } from "@/lib/http";
import { updateTaskSchema } from "@/lib/validation";
import { deleteTask, updateTask } from "@/server/tasks";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/tasks/:id — partial update (title, hours, complexity, day, done, actualHours). */
export const PATCH = route(async (req: Request, { params }: Ctx) => {
  const userId = await requireUserId(req);
  const { id } = await params;
  const input = updateTaskSchema.parse(await req.json());
  return NextResponse.json({ task: await updateTask(userId, id, input) });
});

/** DELETE /api/tasks/:id */
export const DELETE = route(async (req: Request, { params }: Ctx) => {
  const userId = await requireUserId(req);
  const { id } = await params;
  await deleteTask(userId, id);
  return new NextResponse(null, { status: 204 });
});
