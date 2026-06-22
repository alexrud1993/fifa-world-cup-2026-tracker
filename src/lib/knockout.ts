import type { Match, MatchStage, Team, TournamentData } from "./types";

export const knockoutStages = [
  "round-of-32",
  "round-of-16",
  "quarter-final",
  "semi-final",
  "third-place",
  "final"
] as const;

export type KnockoutStage = (typeof knockoutStages)[number];

export type KnockoutMatchesByStage = Record<KnockoutStage, Match[]>;

export interface MatchParticipant {
  label: string;
  isPlaceholder: boolean;
  teamId?: string;
}

export const knockoutStageLabels: Record<KnockoutStage, string> = {
  "round-of-32": "Round of 32",
  "round-of-16": "Round of 16",
  "quarter-final": "Quarter-final",
  "semi-final": "Semi-final",
  "third-place": "Third-place",
  final: "Final"
};

export function groupKnockoutMatchesByStage(data: TournamentData): KnockoutMatchesByStage {
  const grouped = createEmptyKnockoutGroups();

  for (const match of data.matches) {
    if (isKnockoutStage(match.stage)) {
      grouped[match.stage].push(match);
    }
  }

  return grouped;
}

export function getMatchParticipant(
  match: Match,
  side: "home" | "away",
  teamsById: Map<string, Team>
): MatchParticipant {
  const teamId = side === "home" ? match.homeTeamId : match.awayTeamId;
  const placeholder = side === "home" ? match.homePlaceholder : match.awayPlaceholder;

  if (teamId) {
    return {
      label: teamsById.get(teamId)?.name ?? teamId,
      isPlaceholder: !teamsById.has(teamId),
      teamId
    };
  }

  return {
    label: placeholder ?? "To be decided",
    isPlaceholder: true
  };
}

export function getWinnerTeamId(match: Match): string | null {
  if (match.winnerTeamId) {
    return match.winnerTeamId;
  }

  if (
    match.status === "finished" &&
    typeof match.homeScore === "number" &&
    typeof match.awayScore === "number"
  ) {
    if (match.homeScore > match.awayScore) return match.homeTeamId ?? null;
    if (match.awayScore > match.homeScore) return match.awayTeamId ?? null;
  }

  return null;
}

export function isKnockoutStage(stage: MatchStage): stage is KnockoutStage {
  return knockoutStages.includes(stage as KnockoutStage);
}

function createEmptyKnockoutGroups(): KnockoutMatchesByStage {
  return knockoutStages.reduce((groups, stage) => {
    groups[stage] = [];
    return groups;
  }, {} as KnockoutMatchesByStage);
}
