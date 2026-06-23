import { describe, expect, it } from "vitest";

import {
  findLiveUpdateCandidates,
  shouldRunFifaImport
} from "../scripts/should-run-fifa-import.ts";
import type { Match, TournamentData } from "../src/lib/types";

const scheduledMatch: Match = {
  id: "match-010",
  stage: "group",
  kickoffUtc: "2026-06-23T19:00:00Z",
  status: "scheduled"
};

const baseData: TournamentData = {
  tournament: {
    name: "FIFA World Cup 2026",
    year: 2026,
    timezone: "Europe/Kyiv",
    hosts: ["Canada", "Mexico", "United States"],
    lastUpdated: "2026-06-23T00:00:00Z",
    note: "Local JSON data. No API keys are used."
  },
  groups: [],
  teams: [],
  matches: [scheduledMatch]
};

describe("FIFA import scheduling", () => {
  it("runs hourly imports regardless of live windows", () => {
    const result = shouldRunFifaImport(baseData, "hourly", new Date("2026-06-23T12:00:00Z"));

    expect(result.shouldRun).toBe(true);
    expect(result.reason).toBe("hourly update");
  });

  it("runs live imports shortly before and during a scheduled match", () => {
    const candidates = findLiveUpdateCandidates(
      [scheduledMatch],
      new Date("2026-06-23T18:50:00Z")
    );

    expect(candidates.map((match) => match.id)).toEqual(["match-010"]);
  });

  it("skips live imports when no match is in the live window", () => {
    const result = shouldRunFifaImport(baseData, "live", new Date("2026-06-23T15:00:00Z"));

    expect(result.shouldRun).toBe(false);
    expect(result.reason).toBe("no match in live update window");
  });

  it("does not keep polling already finished matches outside live status", () => {
    const result = shouldRunFifaImport({
      ...baseData,
      matches: [{ ...scheduledMatch, status: "finished" }]
    }, "live", new Date("2026-06-23T19:30:00Z"));

    expect(result.shouldRun).toBe(false);
  });
});
