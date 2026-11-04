import { afterAll, beforeEach, describe, expect, it } from "vitest";
import * as login from "@/app/api/auth/login/route";
import * as signup from "@/app/api/auth/signup/route";
import * as me from "@/app/api/me/route";
import * as taskById from "@/app/api/tasks/[id]/route";
import * as tasks from "@/app/api/tasks/route";
import { db } from "@/lib/db";
import { jsonRequest, params, resetDb, sessionCookie } from "./helpers";

async function signUp(email = "pouyan@example.com", password = "correct-horse") {
  const res = await signup.POST(jsonRequest("/api/auth/signup", "POST", { email, password }));
  expect(res.status).toBe(201);
  return sessionCookie(res);
}

async function addTask(cookie: string, body: Record<string, unknown> = {}) {
  const res = await tasks.POST(
    jsonRequest("/api/tasks", "POST", { title: "Write report", hours: 2, complexity: 3, week: "2026-11-02", ...body }, cookie),
  );
  expect(res.status).toBe(201);
  return (await res.json()).task;
}

beforeEach(resetDb);
afterAll(() => db.$disconnect());

describe("auth", () => {
  it("signs up, stores a hash instead of the password, and logs back in", async () => {
    await signUp("Pouyan@Example.com ");
    const user = await db.user.findUniqueOrThrow({ where: { email: "pouyan@example.com" } });
    expect(user.passwordHash).not.toContain("correct-horse");

    const res = await login.POST(
      jsonRequest("/api/auth/login", "POST", { email: "pouyan@example.com", password: "correct-horse" }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toMatch(/HttpOnly/i);
  });

  it("rejects duplicate emails with 409", async () => {
    await signUp();
    const res = await signup.POST(
      jsonRequest("/api/auth/signup", "POST", { email: "pouyan@example.com", password: "another-pass" }),
    );
    expect(res.status).toBe(409);
  });

  it("gives the same answer for a wrong password and an unknown email", async () => {
    await signUp();
    const wrongPassword = await login.POST(
      jsonRequest("/api/auth/login", "POST", { email: "pouyan@example.com", password: "nope-nope" }),
    );
    const unknownEmail = await login.POST(
      jsonRequest("/api/auth/login", "POST", { email: "ghost@example.com", password: "nope-nope" }),
    );
    expect(wrongPassword.status).toBe(401);
    expect(await wrongPassword.json()).toEqual(await unknownEmail.json());
  });

  it("rejects requests without a valid session", async () => {
    expect((await tasks.GET(jsonRequest("/api/tasks", "GET"))).status).toBe(401);
    expect((await me.GET(jsonRequest("/api/me", "GET", undefined, "wp_session=forged.token.value"))).status).toBe(401);
  });
});

describe("tasks", () => {
  it("creates, lists, completes and deletes a task", async () => {
    const cookie = await signUp();
    const task = await addTask(cookie, { day: 1 });
    expect(task).toMatchObject({ title: "Write report", day: 1, done: false });

    const list = await (await tasks.GET(jsonRequest("/api/tasks?week=2026-11-04", "GET", undefined, cookie))).json();
    expect(list.tasks).toHaveLength(1); // a Wednesday resolves to that week's Monday

    const done = await taskById.PATCH(
      jsonRequest(`/api/tasks/${task.id}`, "PATCH", { done: true, actualHours: 3 }, cookie),
      params(task.id),
    );
    const updated = (await done.json()).task;
    expect(updated.done).toBe(true);
    expect(updated.completedAt).not.toBeNull();

    const reopened = (
      await (await taskById.PATCH(jsonRequest(`/api/tasks/${task.id}`, "PATCH", { done: false }, cookie), params(task.id))).json()
    ).task;
    expect(reopened).toMatchObject({ completedAt: null, actualHours: null });

    const del = await taskById.DELETE(jsonRequest(`/api/tasks/${task.id}`, "DELETE", undefined, cookie), params(task.id));
    expect(del.status).toBe(204);
    expect(await db.task.count()).toBe(0);
  });

  it("validates input and reports which field is wrong", async () => {
    const cookie = await signUp();
    const res = await tasks.POST(
      jsonRequest("/api/tasks", "POST", { title: "", hours: 40, complexity: 3 }, cookie),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("validation_error");
    expect(body.error.details.map((d: { path: string }) => d.path)).toEqual(expect.arrayContaining(["title", "hours"]));
  });

  it("rejects unknown fields instead of silently ignoring them", async () => {
    const cookie = await signUp();
    const res = await tasks.POST(
      jsonRequest("/api/tasks", "POST", { title: "x", hours: 1, complexity: 1, userId: "someone-else" }, cookie),
    );
    expect(res.status).toBe(400);
  });

  it("never lets one user read or change another user's tasks", async () => {
    const alice = await signUp("alice@example.com");
    const bob = await signUp("bob@example.com");
    const task = await addTask(alice);

    const bobList = await (await tasks.GET(jsonRequest("/api/tasks?week=2026-11-02", "GET", undefined, bob))).json();
    expect(bobList.tasks).toHaveLength(0);

    const patch = await taskById.PATCH(jsonRequest(`/api/tasks/${task.id}`, "PATCH", { done: true }, bob), params(task.id));
    const del = await taskById.DELETE(jsonRequest(`/api/tasks/${task.id}`, "DELETE", undefined, bob), params(task.id));
    expect(patch.status).toBe(404);
    expect(del.status).toBe(404);
    expect((await db.task.findUniqueOrThrow({ where: { id: task.id } })).done).toBe(false);
  });
});

describe("profile", () => {
  it("updates availability and rejects the wrong number of days", async () => {
    const cookie = await signUp();
    const ok = await me.PATCH(jsonRequest("/api/me", "PATCH", { availability: [3, 3, 3, 3, 3, 0, 0] }, cookie));
    expect((await ok.json()).availability).toEqual([3, 3, 3, 3, 3, 0, 0]);

    const bad = await me.PATCH(jsonRequest("/api/me", "PATCH", { availability: [3, 3] }, cookie));
    expect(bad.status).toBe(400);
  });
});
