import { describe, expect, it } from "vitest";
import { calculateGroupStandings } from "../src/lib/standings";
import type { Match, TournamentData } from "../src/lib/types";

const baseData: TournamentData = {
  tournament: {
    name: "FIFA World Cup 2026",
    year: 2026,
    timezone: "Europe/Kyiv",
    hosts: ["Canada", "Mexico", "United States"],
    note: "Test data"
  },
  groups: [{ id: "A", name: "Group A", teamIds: ["alpha", "bravo", "charlie", "delta"] }],
  teams: [
    { id: "alpha", name: "Alpha", code: "ALP", group: "A" },
    { id: "bravo", name: "Bravo", code: "BRV", group: "A" },
    { id: "charlie", name: "Charlie", code: "CHA", group: "A" },
    { id: "delta", name: "Delta", code: "DEL", group: "A" }
  ],
  matches: []
};

describe("calculateGroupStandings", () => {
  it("finished win updates both teams", () => {
    const rows = standings([match("alpha", "bravo", 2, 0)]);

    expect(rows[0]).toMatchObject({
      teamId: "alpha",
      played: 1,
      won: 1,
      drawn: 0,
      lost: 0,
      goalsFor: 2,
      goalsAgainst: 0,
      goalDifference: 2,
      points: 3,
      rank: 1,
      qualificationStatus: "qualified-zone"
    });
    expect(rows.find((row) => row.teamId === "bravo")).toMatchObject({
      played: 1,
      won: 0,
      lost: 1,
      goalsFor: 0,
      goalsAgainst: 2,
      points: 0
    });
  });

  it("draw gives both teams 1 point", () => {
    const rows = standings([match("alpha", "bravo", 1, 1)]);

    expect(rows.find((row) => row.teamId === "alpha")).toMatchObject({
      played: 1,
      drawn: 1,
      points: 1
    });
    expect(rows.find((row) => row.teamId === "bravo")).toMatchObject({
      played: 1,
      drawn: 1,
      points: 1
    });
  });

  it("scheduled match is ignored", () => {
    const rows = standings([{ ...match("alpha", "bravo", 3, 0), status: "scheduled" }]);

    expect(rows.every((row) => row.played === 0)).toBe(true);
  });

  it("live match is ignored", () => {
    const rows = standings([{ ...match("alpha", "bravo", 3, 0), status: "live" }]);

    expect(rows.every((row) => row.played === 0)).toBe(true);
  });

  it("missing score is ignored", () => {
    const rows = standings([
      {
        ...match("alpha", "bravo", 3, 0),
        homeScore: undefined
      }
    ]);

    expect(rows.every((row) => row.played === 0)).toBe(true);
  });

  it("sorting by points works", () => {
    const rows = standings([match("alpha", "bravo", 1, 0), match("charlie", "delta", 1, 1)]);

    expect(rows.map((row) => row.teamId)).toEqual(["alpha", "charlie", "delta", "bravo"]);
  });

  it("sorting by goal difference works", () => {
    const rows = standings([match("alpha", "bravo", 1, 0), match("charlie", "delta", 3, 0)]);

    expect(rows.map((row) => row.teamId).slice(0, 2)).toEqual(["charlie", "alpha"]);
  });

  it("sorting by goals for works", () => {
    const rows = standings([
      match("alpha", "bravo", 2, 0),
      match("charlie", "delta", 3, 1)
    ]);

    expect(rows.map((row) => row.teamId).slice(0, 2)).toEqual(["charlie", "alpha"]);
  });
});

function standings(matches: Match[]) {
  return calculateGroupStandings({ ...baseData, matches }).A;
}

function match(homeTeamId: string, awayTeamId: string, homeScore: number, awayScore: number): Match {
  return {
    id: `${homeTeamId}-${awayTeamId}`,
    stage: "group",
    homeTeamId,
    awayTeamId,
    homeScore,
    awayScore,
    kickoffUtc: "2026-06-11T19:00:00Z",
    venue: "Test Stadium",
    city: "Test City",
    status: "finished"
  };
}
