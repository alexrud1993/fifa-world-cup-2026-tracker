import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";
import { pathToFileURL } from "node:url";

const LOCAL_DATA_PATH = join(cwd(), "public", "data", "worldcup-2026.json");
export const IMPORTED_DATA_PATH = join(cwd(), "public", "data", "imported-worldcup-2026.json");

type JsonObject = Record<string, unknown>;

export interface NormalizedTournamentData {
  tournament: JsonObject;
  groups: JsonObject[];
  teams: JsonObject[];
  matches: JsonObject[];
  venues?: JsonObject[];
  importMeta: {
    importedAt: string;
    source: string;
    note: string;
  };
}

export async function normalizePublicData(
  sourceData: unknown,
  sourceLabel: string
): Promise<NormalizedTournamentData> {
  const localData = await readJsonFile<JsonObject>(LOCAL_DATA_PATH);
  const source = isObject(sourceData) ? sourceData : {};

  return {
    tournament: normalizeTournament(source.tournament, localData.tournament),
    groups: normalizeObjectArray(source.groups),
    teams: normalizeObjectArray(source.teams),
    matches: normalizeMatches(source.matches),
    ...(Array.isArray(source.venues) ? { venues: normalizeObjectArray(source.venues) } : {}),
    importMeta: {
      importedAt: new Date().toISOString(),
      source: sourceLabel,
      note: "Optional import only. Compare this file with worldcup-2026.json and copy updates manually."
    }
  };
}

export async function writeNormalizedPublicData(data: NormalizedTournamentData) {
  await writeFile(IMPORTED_DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

async function runCli() {
  const inputPath = process.argv[2] ? join(cwd(), process.argv[2]) : LOCAL_DATA_PATH;
  const sourceData = await readJsonFile<unknown>(inputPath);
  const normalized = await normalizePublicData(sourceData, inputPath);

  await writeNormalizedPublicData(normalized);
  console.log(`Normalized public data written to ${IMPORTED_DATA_PATH}`);
}

async function readJsonFile<T>(path: string): Promise<T> {
  const file = await readFile(path, "utf-8");
  return JSON.parse(file) as T;
}

function normalizeTournament(value: unknown, fallback: unknown): JsonObject {
  if (isObject(value)) return value;
  if (isObject(fallback)) return fallback;
  return {
    name: "FIFA World Cup 2026",
    year: 2026,
    timezone: "Europe/Kyiv",
    hosts: ["Canada", "Mexico", "United States"],
    lastUpdated: new Date().toISOString(),
    note: "Generated from optional public import."
  };
}

function normalizeObjectArray(value: unknown): JsonObject[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isObject);
}

function normalizeMatches(value: unknown): JsonObject[] {
  return normalizeObjectArray(value).map((match, index) => {
    const normalized: JsonObject = {
      ...match,
      id: typeof match.id === "string" && match.id.trim() !== "" ? match.id : `imported-match-${index + 1}`
    };

    if (typeof normalized.status !== "string") {
      normalized.status = "scheduled";
    }

    return normalized;
  });
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Failed to normalize public data.");
    process.exit(1);
  });
}
