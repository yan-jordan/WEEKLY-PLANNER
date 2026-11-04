import { z } from "zod";
import { parseWeek } from "./week";

export const MAX_TASK_HOURS = 12;

const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address."));

export const signupSchema = z
  .object({
    email,
    // bcrypt only uses the first 72 bytes, so longer passwords would be silently truncated.
    password: z.string().min(8, "Password must be at least 8 characters.").max(72, "Password is too long."),
    name: z.string().trim().min(1).max(60).optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email,
    password: z.string().min(1, "Password is required."),
  })
  .strict();

/** "YYYY-MM-DD" that is turned into that week's Monday. */
export const weekParam = z.string().transform((value, ctx) => {
  const week = parseWeek(value);
  if (!week) {
    ctx.addIssue({ code: "custom", message: "Expected a date in YYYY-MM-DD format." });
    return z.NEVER;
  }
  return week;
});

const title = z.string().trim().min(1, "Title is required.").max(120, "Title is too long.");
const hours = z.number().int().min(1).max(MAX_TASK_HOURS);
const complexity = z.number().int().min(1).max(5);
const day = z.number().int().min(0).max(6).nullable();

export const createTaskSchema = z
  .object({
    title,
    hours,
    complexity,
    week: weekParam.optional(),
    day: day.optional(),
  })
  .strict();

export const updateTaskSchema = z
  .object({
    title: title.optional(),
    hours: hours.optional(),
    complexity: complexity.optional(),
    day: day.optional(),
    done: z.boolean().optional(),
    actualHours: z.number().int().min(1).max(24).nullable().optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: "Provide at least one field to update." });

export const listTasksQuery = z.object({ week: weekParam.optional() });

export const availabilitySchema = z
  .object({
    availability: z.array(z.number().int().min(0).max(16)).length(7, "Provide hours for all 7 days."),
  })
  .strict();

export const planRequestSchema = z.object({ week: weekParam.optional() }).strict();

export const applyPlanSchema = z
  .object({
    week: weekParam,
    assignments: z
      .array(z.object({ taskId: z.string().min(1), day: day }).strict())
      .min(1)
      .max(200),
  })
  .strict();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
