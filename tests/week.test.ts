import { describe, expect, it } from "vitest";
import { addWeeks, formatWeek, parseWeek, startOfWeek } from "@/lib/week";

describe("week helpers", () => {
  it("maps any day to that week's Monday", () => {
    expect(formatWeek(startOfWeek(new Date("2026-11-04T15:00:00Z")))).toBe("2026-11-02"); // Wednesday
    expect(formatWeek(startOfWeek(new Date("2026-11-08T23:59:00Z")))).toBe("2026-11-02"); // Sunday
    expect(formatWeek(startOfWeek(new Date("2026-11-09T00:00:00Z")))).toBe("2026-11-09"); // Monday
  });

  it("rejects malformed and impossible dates", () => {
    expect(parseWeek("2026-02-30")).toBeNull();
    expect(parseWeek("11/04/2026")).toBeNull();
    expect(formatWeek(parseWeek("2026-11-04")!)).toBe("2026-11-02");
  });

  it("crosses year boundaries", () => {
    expect(formatWeek(addWeeks(parseWeek("2026-12-28")!, 1))).toBe("2027-01-04");
  });
});
