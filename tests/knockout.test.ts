import { describe, expect, it } from "vitest";
import {
  getMatchParticipant,
  getWinnerTeamId,
  groupKnockoutMatchesByStage
} from "../src/lib/knockout";
import type { Match, Team, TournamentData } from "../src/lib/types";

const teams: Team[] = [
  { id: "alpha", name: "Alpha FC", code: "ALP", group: "A" },
  { id: "bravo", name: "Bravo FC", code: "BRV", group: "B" }
];

const baseData: TournamentData = {
  tournament: {
    name: "FIFA World Cup 2026",
    year: 2026,
    timezone: "Europe/Kyiv",
    hosts: ["Canada", "Mexico", "United States"],
    note: "Test data"
  },
  groups: [],
  teams,
  matches: []
};

describe("knockout helpers", () => {
  it("groups knockout matches by stage", () => {
    const grouped = groupKnockoutMatchesByStage({
      ...baseData,
      matches: [
        knockoutMatch({ id: "r32", stage: "round-of-32" }),
        knockoutMatch({ id: "final", stage: "final" }),
        knockoutMatch({ id: "group", stage: "group" })
      ]
    });

    expect(grouped["round-of-32"].map((match) => match.id)).toEqual(["r32"]);
    expect(grouped.final.map((match) => match.id)).toEqual(["final"]);
    expect(grouped["semi-final"]).toEqual([]);
  });

  it("shows placeholder if team ID is missing", () => {
    const participant = getMatchParticipant(
      knockoutMatch({ homePlaceholder: "Winner Group A" }),
      "home",
      new Map(teams.map((team) => [team.id, team]))
    );

    expect(participant).toEqual({
      label: "Winner Group A",
      isPlaceholder: true
    });
  });

  it("shows team name if team ID exists", () => {
    const participant = getMatchParticipant(
      knockoutMatch({ homeTeamId: "alpha" }),
      "home",
      new Map(teams.map((team) => [team.id, team]))
    );

    expect(participant).toEqual({
      label: "Alpha FC",
      isPlaceholder: false,
      teamId: "alpha"
    });
  });

  it("winner is detected from winnerTeamId", () => {
    expect(
      getWinnerTeamId(
        knockoutMatch({
          homeTeamId: "alpha",
          awayTeamId: "bravo",
          winnerTeamId: "bravo",
          status: "finished",
          homeScore: 1,
          awayScore: 2
        })
      )
    ).toBe("bravo");
  });
});

function knockoutMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: "match",
    stage: "round-of-32",
    kickoffUtc: "2026-06-28T20:00:00Z",
    venue: "Test Stadium",
    city: "Test City",
    status: "scheduled",
    ...overrides
  };
}
