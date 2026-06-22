import { describe, expect, it } from "vitest";
import {
  formatDateKyiv,
  formatDateTimeKyiv,
  formatTimeKyiv,
  isTodayKyiv,
  sortMatchesByDate
} from "../src/lib/dates";
import type { Match } from "../src/lib/types";

describe("dates helpers", () => {
  it("formats a valid UTC date for Kyiv", () => {
    expect(formatDateKyiv("2026-06-11T19:00:00Z")).toBe("11 June 2026");
    expect(formatTimeKyiv("2026-06-11T19:00:00Z")).toBe("22:00");
    expect(formatDateTimeKyiv("2026-06-11T19:00:00Z")).toBe("11 June 2026 22:00");
  });

  it("returns a user-friendly fallback for an invalid date", () => {
    expect(formatDateKyiv("not-a-date")).toBe("Date unavailable");
    expect(formatTimeKyiv("not-a-date")).toBe("Time unavailable");
    expect(formatDateTimeKyiv("not-a-date")).toBe("Date and time unavailable");
    expect(isTodayKyiv("not-a-date")).toBe(false);
  });

  it("sorts matches by kickoff date and keeps invalid dates last", () => {
    const matches: Match[] = [
      createMatch("3", "invalid-date"),
      createMatch("2", "2026-06-12T01:00:00Z"),
      createMatch("1", "2026-06-11T19:00:00Z")
    ];

    expect(sortMatchesByDate(matches).map((match) => match.id)).toEqual(["1", "2", "3"]);
  });

  it("checks today in Kyiv with an injectable current date", () => {
    const now = new Date("2026-06-11T18:30:00Z");

    expect(isTodayKyiv("2026-06-11T19:00:00Z", now)).toBe(true);
    expect(isTodayKyiv("2026-06-12T22:30:00Z", now)).toBe(false);
  });
});

function createMatch(id: string, kickoffUtc: string): Match {
  return {
    id,
    stage: "group",
    kickoffUtc,
    status: "scheduled",
    venue: "Test Venue",
    city: "Test City"
  };
}
