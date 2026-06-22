export type ViewId = "home" | "groups" | "matches" | "knockout" | "about";

export interface Group {
  id: string;
  name: string;
  teamIds: string[];
}

export interface Team {
  id: string;
  name: string;
  code: string;
  group: string;
}

export type MatchStage =
  | "group"
  | "round-of-32"
  | "round-of-16"
  | "quarter-final"
  | "semi-final"
  | "third-place"
  | "final";

export type MatchStatus = "scheduled" | "live" | "finished" | "postponed" | "cancelled";

// Source-of-truth match schema uses kickoffUtc plus direct venue/city text.
// Do not migrate this app to dateUtc, venueId, or a required venues array.
export interface Match {
  id: string;
  stage: MatchStage;
  groupId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homePlaceholder?: string;
  awayPlaceholder?: string;
  winnerTeamId?: string;
  kickoffUtc: string;
  venue?: string;
  city?: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
}

export interface TournamentData {
  tournament: {
    name: string;
    year: number;
    timezone: string;
    hosts: string[];
    lastUpdated: string;
    note: string;
  };
  groups: Group[];
  teams: Team[];
  matches: Match[];
}
