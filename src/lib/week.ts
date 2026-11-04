/**
 * Weeks are identified by their Monday, stored as a UTC date ("YYYY-MM-DD").
 * Days are indexed 0 (Monday) to 6 (Sunday).
 */
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Monday 00:00 UTC of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const mondayOffset = (d.getUTCDay() + 6) % 7; // getUTCDay: 0 = Sunday
  return new Date(d.getTime() - mondayOffset * MS_PER_DAY);
}

export function formatWeek(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Parses "YYYY-MM-DD" and returns that week's Monday, or null if the string is not a real date. */
export function parseWeek(value: string): Date | null {
  if (!ISO_DATE.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || formatWeek(d) !== value) return null;
  return startOfWeek(d);
}

export function addWeeks(weekStart: Date, weeks: number): Date {
  return new Date(weekStart.getTime() + weeks * 7 * MS_PER_DAY);
}

export function currentWeek(now = new Date()): Date {
  return startOfWeek(now);
}

/** The calendar date of a given day index within a week. */
export function dayDate(weekStart: Date, day: number): Date {
  return new Date(weekStart.getTime() + day * MS_PER_DAY);
}
