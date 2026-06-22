import type { Group, Match, Team, TournamentData } from "./types";

export type QualificationStatus = "qualified-zone" | "third-place-zone" | "normal";

export interface StandingRow {
  teamId: string;
  rank: number;
  qualificationStatus: QualificationStatus;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export type GroupStandings = Record<string, StandingRow[]>;

function createEmptyRow(teamId: string): StandingRow {
  return {
    teamId,
    rank: 0,
    qualificationStatus: "normal",
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0
  };
}

export function calculateGroupStandings(data: TournamentData): GroupStandings {
  const teamsById = new Map(data.teams.map((team) => [team.id, team]));

  return data.groups.reduce<GroupStandings>((standingsByGroup, group) => {
    const rows = calculateSingleGroupStandings(group, data.matches, teamsById);
    standingsByGroup[group.id] = rows;
    return standingsByGroup;
  }, {});
}

function calculateSingleGroupStandings(
  group: Group,
  matches: Match[],
  teamsById: Map<string, Team>
): StandingRow[] {
  const rows = new Map<string, StandingRow>();

  for (const teamId of group.teamIds) {
    if (teamsById.has(teamId)) {
      rows.set(teamId, createEmptyRow(teamId));
    }
  }

  for (const match of matches) {
    if (
      !isFinishedScoredGroupMatch(match) ||
      !teamsById.has(match.homeTeamId) ||
      !teamsById.has(match.awayTeamId) ||
      !rows.has(match.homeTeamId) ||
      !rows.has(match.awayTeamId)
    ) {
      continue;
    }

    const homeRow = rows.get(match.homeTeamId);
    const awayRow = rows.get(match.awayTeamId);

    if (!homeRow || !awayRow) {
      continue;
    }

    homeRow.played += 1;
    awayRow.played += 1;

    homeRow.goalsFor += match.homeScore;
    homeRow.goalsAgainst += match.awayScore;
    awayRow.goalsFor += match.awayScore;
    awayRow.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      homeRow.won += 1;
      homeRow.points += 3;
      awayRow.lost += 1;
    } else if (match.homeScore < match.awayScore) {
      awayRow.won += 1;
      awayRow.points += 3;
      homeRow.lost += 1;
    } else {
      homeRow.drawn += 1;
      awayRow.drawn += 1;
      homeRow.points += 1;
      awayRow.points += 1;
    }
  }

  for (const row of rows.values()) {
    row.goalDifference = row.goalsFor - row.goalsAgainst;
  }

  // TODO: Add the full official FIFA tie-breaker sequence later.
  return [...rows.values()].sort((left, right) => {
    if (right.points !== left.points) return right.points - left.points;
    if (right.goalDifference !== left.goalDifference) return right.goalDifference - left.goalDifference;
    if (right.goalsFor !== left.goalsFor) return right.goalsFor - left.goalsFor;
    return getTeamName(left.teamId, teamsById).localeCompare(getTeamName(right.teamId, teamsById));
  }).map((row, index) => ({
    ...row,
    rank: index + 1,
    qualificationStatus: getQualificationStatus(index + 1)
  }));
}

function isFinishedScoredGroupMatch(
  match: Match
): match is Match & {
  stage: "group";
  status: "finished";
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
} {
  return (
    match.stage === "group" &&
    match.status === "finished" &&
    typeof match.homeTeamId === "string" &&
    typeof match.awayTeamId === "string" &&
    typeof match.homeScore === "number" &&
    typeof match.awayScore === "number"
  );
}

function getTeamName(teamId: string, teamsById: Map<string, Team>) {
  return teamsById.get(teamId)?.name ?? teamId;
}

function getQualificationStatus(rank: number): QualificationStatus {
  if (rank <= 2) return "qualified-zone";
  if (rank === 3) return "third-place-zone";
  return "normal";
}
