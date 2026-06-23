import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";
import { pathToFileURL } from "node:url";
import type { Match, MatchStage, MatchStatus, TournamentData } from "../src/lib/types.ts";

const LOCAL_DATA_PATH = join(cwd(), "public", "data", "worldcup-2026.json");
export const DEFAULT_FIFA_DATA_URL =
  "https://api.fifa.com/api/v3/calendar/matches?idSeason=285023&language=en&count=200";

type JsonObject = Record<string, unknown>;

export interface FifaCalendarResponse {
  Results?: unknown[];
}

export interface ImportSummary {
  source: string;
  updatedMatches: number;
  unchangedMatches: number;
  skippedMatches: number;
}

export function normalizeFifaData(
  currentData: TournamentData,
  fifaData: FifaCalendarResponse,
  nowIso = new Date().toISOString()
): { data: TournamentData; summary: ImportSummary } {
  const matchesById = new Map(currentData.matches.map((match) => [match.id, match]));
  let updatedMatches = 0;
  let unchangedMatches = 0;
  let skippedMatches = 0;

  const importedMatches = Array.isArray(fifaData.Results) ? fifaData.Results : [];
  const nextMatches = [...currentData.matches];

  for (const sourceMatch of importedMatches) {
    if (!isObject(sourceMatch)) {
      skippedMatches += 1;
      continue;
    }

    const matchNumber = toNumber(sourceMatch.MatchNumber);
    const matchId = matchNumber ? `match-${String(matchNumber).padStart(3, "0")}` : null;
    const currentMatch = matchId ? matchesById.get(matchId) : undefined;

    if (!matchId || !currentMatch) {
      skippedMatches += 1;
      continue;
    }

    const nextMatch = mapFifaMatch(sourceMatch, currentMatch);
    const index = nextMatches.findIndex((match) => match.id === matchId);

    if (JSON.stringify(nextMatch) === JSON.stringify(currentMatch)) {
      unchangedMatches += 1;
      continue;
    }

    nextMatches[index] = nextMatch;
    updatedMatches += 1;
  }

  return {
    data: {
      ...currentData,
      tournament: {
        ...currentData.tournament,
        lastUpdated: updatedMatches + unchangedMatches > 0 ? nowIso : currentData.tournament.lastUpdated
      },
      matches: nextMatches
    },
    summary: {
      source: "FIFA calendar API",
      updatedMatches,
      unchangedMatches,
      skippedMatches
    }
  };
}

export function mapFifaMatch(sourceMatch: JsonObject, currentMatch: Match): Match {
  const home = isObject(sourceMatch.Home) ? sourceMatch.Home : null;
  const away = isObject(sourceMatch.Away) ? sourceMatch.Away : null;
  const stadium = isObject(sourceMatch.Stadium) ? sourceMatch.Stadium : null;
  const status = mapFifaStatus(sourceMatch, currentMatch.status);
  const homeScore = toNumber(sourceMatch.HomeTeamScore);
  const awayScore = toNumber(sourceMatch.AwayTeamScore);
  const hasScore = typeof homeScore === "number" && typeof awayScore === "number";

  const nextMatch: Match = {
    ...currentMatch,
    stage: mapFifaStage(getLocalizedDescription(sourceMatch.StageName), currentMatch.stage),
    kickoffUtc: toIsoString(sourceMatch.Date) ?? currentMatch.kickoffUtc,
    venue: getLocalizedDescription(stadium?.Name) ?? currentMatch.venue,
    city: getLocalizedDescription(stadium?.CityName) ?? currentMatch.city,
    status
  };

  const groupId = mapFifaGroupId(getLocalizedDescription(sourceMatch.GroupName));
  if (groupId) {
    nextMatch.groupId = groupId;
  } else {
    delete nextMatch.groupId;
  }

  applyParticipant(nextMatch, "home", home, sourceMatch.PlaceHolderA);
  applyParticipant(nextMatch, "away", away, sourceMatch.PlaceHolderB);

  if ((status === "finished" || status === "live") && hasScore) {
    nextMatch.homeScore = homeScore;
    nextMatch.awayScore = awayScore;
  } else {
    delete nextMatch.homeScore;
    delete nextMatch.awayScore;
  }

  const winnerTeamId = typeof sourceMatch.Winner === "string" && sourceMatch.Winner.trim()
    ? sourceMatch.Winner
    : null;
  if (status === "finished" && winnerTeamId) {
    nextMatch.winnerTeamId = winnerTeamId;
  } else {
    delete nextMatch.winnerTeamId;
  }

  return nextMatch;
}

export function mapFifaStatus(sourceMatch: JsonObject, fallbackStatus: MatchStatus): MatchStatus {
  const matchStatus = toNumber(sourceMatch.MatchStatus);
  const resultType = toNumber(sourceMatch.ResultType);

  if (matchStatus === 1 && resultType === 0) {
    return "scheduled";
  }

  if (matchStatus === 0 && resultType === 1) {
    return "finished";
  }

  const hasScore = typeof toNumber(sourceMatch.HomeTeamScore) === "number" &&
    typeof toNumber(sourceMatch.AwayTeamScore) === "number";
  const hasTime = typeof sourceMatch.MatchTime === "string" && sourceMatch.MatchTime.trim() !== "";

  if (hasScore || hasTime) {
    return "live";
  }

  return fallbackStatus;
}

export function mapFifaStage(value: string | undefined, fallbackStage: MatchStage): MatchStage {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) return fallbackStage;
  if (normalized === "first stage" || normalized === "group stage") return "group";
  if (normalized === "round of 32") return "round-of-32";
  if (normalized === "round of 16") return "round-of-16";
  if (normalized === "quarter-final" || normalized === "quarter-finals") return "quarter-final";
  if (normalized === "semi-final" || normalized === "semi-finals") return "semi-final";
  if (normalized === "play-off for third place" || normalized === "third-place match") return "third-place";
  if (normalized === "final") return "final";

  return fallbackStage;
}

async function runCli() {
  const sourceUrl = process.env.PUBLIC_DATA_URL?.trim() || DEFAULT_FIFA_DATA_URL;
  const currentData = await readJsonFile<TournamentData>(LOCAL_DATA_PATH);
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`FIFA data import failed: ${response.status} ${response.statusText}`);
  }

  const sourceData = (await response.json()) as FifaCalendarResponse;
  const { data, summary } = normalizeFifaData(currentData, sourceData);

  await writeFile(LOCAL_DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
  console.log(
    `FIFA data imported from ${sourceUrl}: ${summary.updatedMatches} updated, ` +
      `${summary.unchangedMatches} unchanged, ${summary.skippedMatches} skipped.`
  );
}

async function readJsonFile<T>(path: string): Promise<T> {
  const file = await readFile(path, "utf-8");
  return JSON.parse(file) as T;
}

function applyParticipant(
  match: Match,
  side: "home" | "away",
  team: JsonObject | null,
  placeholder: unknown
) {
  const teamIdKey = side === "home" ? "homeTeamId" : "awayTeamId";
  const placeholderKey = side === "home" ? "homePlaceholder" : "awayPlaceholder";
  const teamId = typeof team?.IdTeam === "string" && team.IdTeam.trim() ? team.IdTeam : null;
  const placeholderLabel = typeof placeholder === "string" && placeholder.trim() ? placeholder : null;

  if (teamId) {
    match[teamIdKey] = teamId;
    delete match[placeholderKey];
    return;
  }

  delete match[teamIdKey];
  match[placeholderKey] = placeholderLabel ?? "To be decided";
}

function mapFifaGroupId(value: string | undefined) {
  const match = value?.match(/^Group\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function getLocalizedDescription(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const english = value.find((item) =>
    isObject(item) &&
    typeof item.Description === "string" &&
    typeof item.Locale === "string" &&
    item.Locale.toLowerCase().startsWith("en")
  );
  const fallback = value.find((item) => isObject(item) && typeof item.Description === "string");
  const description = isObject(english) ? english.Description : isObject(fallback) ? fallback.Description : undefined;

  return typeof description === "string" && description.trim() ? description : undefined;
}

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function toIsoString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) {
    return undefined;
  }

  return value.endsWith("Z") ? value : parsed.toISOString();
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Failed to import FIFA data.");
    process.exit(1);
  });
}
