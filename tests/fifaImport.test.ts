import { describe, expect, it } from "vitest";
import {
  mapFifaStatus,
  normalizeFifaData
} from "../scripts/import-fifa-data.ts";
import type { TournamentData } from "../src/lib/types";

const baseData: TournamentData = {
  tournament: {
    name: "FIFA World Cup 2026",
    year: 2026,
    timezone: "Europe/Kyiv",
    hosts: ["Canada", "Mexico", "United States"],
    lastUpdated: "2026-06-01T00:00:00Z",
    note: "Local JSON data. No API keys are used."
  },
  groups: [
    {
      id: "A",
      name: "Group A",
      teamIds: ["43911", "43883"]
    }
  ],
  teams: [
    {
      id: "43911",
      name: "Mexico",
      code: "MEX",
      group: "A"
    },
    {
      id: "43883",
      name: "South Africa",
      code: "RSA",
      group: "A"
    }
  ],
  matches: [
    {
      id: "match-001",
      stage: "group",
      kickoffUtc: "2026-06-11T19:00:00Z",
      venue: "Old venue",
      city: "Old city",
      status: "scheduled",
      groupId: "A",
      homeTeamId: "43911",
      awayTeamId: "43883"
    },
    {
      id: "match-002",
      stage: "round-of-32",
      kickoffUtc: "2026-06-29T19:00:00Z",
      venue: "Old knockout venue",
      city: "Old knockout city",
      status: "scheduled",
      homePlaceholder: "Winner Group A",
      awayPlaceholder: "Runner-up Group B"
    }
  ]
};

describe("FIFA data import", () => {
  it("maps FIFA match fields into the existing local schema", () => {
    const { data, summary } = normalizeFifaData(baseData, {
      Results: [
        {
          MatchNumber: 1,
          Date: "2026-06-11T19:00:00Z",
          StageName: [{ Locale: "en-GB", Description: "First Stage" }],
          GroupName: [{ Locale: "en-GB", Description: "Group A" }],
          Home: { IdTeam: "43911" },
          Away: { IdTeam: "43883" },
          HomeTeamScore: 2,
          AwayTeamScore: 0,
          Winner: "43911",
          MatchStatus: 0,
          ResultType: 1,
          Stadium: {
            Name: [{ Locale: "en-GB", Description: "Mexico City Stadium" }],
            CityName: [{ Locale: "en-GB", Description: "Mexico City" }]
          }
        }
      ]
    }, "2026-06-11T22:00:00Z");

    expect(summary.updatedMatches).toBe(1);
    expect(data.tournament.lastUpdated).toBe("2026-06-11T22:00:00Z");
    expect(data.matches[0]).toMatchObject({
      id: "match-001",
      stage: "group",
      kickoffUtc: "2026-06-11T19:00:00Z",
      venue: "Mexico City Stadium",
      city: "Mexico City",
      status: "finished",
      groupId: "A",
      homeTeamId: "43911",
      awayTeamId: "43883",
      homeScore: 2,
      awayScore: 0,
      winnerTeamId: "43911"
    });
  });

  it("uses placeholders when knockout teams are not known", () => {
    const { data } = normalizeFifaData(baseData, {
      Results: [
        {
          MatchNumber: 2,
          Date: "2026-06-29T19:00:00Z",
          StageName: [{ Locale: "en-GB", Description: "Round of 32" }],
          Home: null,
          Away: null,
          PlaceHolderA: "W1",
          PlaceHolderB: "W2",
          MatchStatus: 1,
          ResultType: 0,
          Stadium: {
            Name: [{ Locale: "en-GB", Description: "Dallas Stadium" }],
            CityName: [{ Locale: "en-GB", Description: "Dallas" }]
          }
        }
      ]
    });

    expect(data.matches[1]).toMatchObject({
      id: "match-002",
      stage: "round-of-32",
      venue: "Dallas Stadium",
      city: "Dallas",
      status: "scheduled",
      homePlaceholder: "W1",
      awayPlaceholder: "W2"
    });
    expect(data.matches[1]).not.toHaveProperty("homeTeamId");
    expect(data.matches[1]).not.toHaveProperty("awayTeamId");
  });

  it("maps scheduled, finished, live, and unknown statuses", () => {
    expect(mapFifaStatus({ MatchStatus: 1, ResultType: 0 }, "finished")).toBe("scheduled");
    expect(mapFifaStatus({ MatchStatus: 0, ResultType: 1 }, "scheduled")).toBe("finished");
    expect(mapFifaStatus({ MatchStatus: 2, ResultType: 0, MatchTime: "45'" }, "scheduled")).toBe("live");
    expect(mapFifaStatus({ MatchStatus: 9, ResultType: 9 }, "postponed")).toBe("postponed");
  });

  it("preserves the existing match schema shape", () => {
    const { data } = normalizeFifaData(baseData, {
      Results: [
        {
          MatchNumber: 1,
          Date: "2026-06-11T19:00:00Z",
          StageName: [{ Locale: "en-GB", Description: "First Stage" }],
          GroupName: [{ Locale: "en-GB", Description: "Group A" }],
          Home: { IdTeam: "43911" },
          Away: { IdTeam: "43883" },
          MatchStatus: 1,
          ResultType: 0,
          Stadium: {
            Name: [{ Locale: "en-GB", Description: "Mexico City Stadium" }],
            CityName: [{ Locale: "en-GB", Description: "Mexico City" }]
          }
        }
      ]
    });

    expect(data.matches[0]).toHaveProperty("kickoffUtc");
    expect(data.matches[0]).toHaveProperty("venue");
    expect(data.matches[0]).toHaveProperty("city");
    expect(data.matches[0]).not.toHaveProperty("dateUtc");
    expect(data.matches[0]).not.toHaveProperty("venueId");
  });
});
