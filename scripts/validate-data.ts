import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cwd, exit } from "node:process";

const dataFile = join(cwd(), "public", "data", "worldcup-2026.json");
const validStages = new Set([
  "group",
  "round-of-32",
  "round-of-16",
  "quarter-final",
  "semi-final",
  "third-place",
  "final"
]);
const validStatuses = new Set(["scheduled", "live", "finished", "postponed", "cancelled"]);

type JsonObject = Record<string, unknown>;

const errors: string[] = [];

try {
  const file = await readFile(dataFile, "utf-8");
  const data = JSON.parse(file) as unknown;

  validateTournamentData(data);
} catch (error) {
  errors.push(error instanceof Error ? error.message : "Could not read tournament data.");
}

if (errors.length > 0) {
  console.error("Data validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  exit(1);
}

console.log("Data validation passed: public/data/worldcup-2026.json");
exit(0);

function validateTournamentData(data: unknown) {
  if (!isObject(data)) {
    errors.push("Root JSON value must be an object.");
    return;
  }

  const teams = getRequiredArray(data, "teams");
  const groups = getRequiredArray(data, "groups");
  const matches = getRequiredArray(data, "matches");

  if (!teams || !groups || !matches) {
    return;
  }

  const teamIds = collectIds(teams, "teams");

  matches.forEach((match, index) => {
    const label = getMatchLabel(match, index);

    if (!isObject(match)) {
      errors.push(`${label} must be an object.`);
      return;
    }

    requireString(match, "id", label);
    validateEnumString(match, "stage", validStages, label);
    validateEnumString(match, "status", validStatuses, label);
    validateKickoffUtc(match, label);
    validateOptionalString(match, "venue", label);
    validateOptionalString(match, "city", label);

    if (match.status === "finished") {
      if (typeof match.homeScore !== "number") {
        errors.push(`${label} is finished but homeScore is not a number.`);
      }

      if (typeof match.awayScore !== "number") {
        errors.push(`${label} is finished but awayScore is not a number.`);
      }
    }

    validateTeamReference(match, "homeTeamId", teamIds, label);
    validateTeamReference(match, "awayTeamId", teamIds, label);
  });
}

function getRequiredArray(data: JsonObject, key: string): unknown[] | null {
  const value = data[key];

  if (!Array.isArray(value)) {
    errors.push(`"${key}" array is required.`);
    return null;
  }

  return value;
}

function collectIds(items: unknown[], collectionName: string): Set<string> {
  const ids = new Set<string>();

  items.forEach((item, index) => {
    if (!isObject(item)) {
      errors.push(`${collectionName}[${index}] must be an object.`);
      return;
    }

    if (typeof item.id !== "string" || item.id.trim() === "") {
      errors.push(`${collectionName}[${index}] must have a non-empty id.`);
      return;
    }

    ids.add(item.id);
  });

  return ids;
}

function requireString(match: JsonObject, key: string, label: string) {
  if (typeof match[key] !== "string" || String(match[key]).trim() === "") {
    errors.push(`${label} must have a non-empty ${key}.`);
  }
}

function validateEnumString(
  match: JsonObject,
  key: "stage" | "status",
  allowedValues: Set<string>,
  label: string
) {
  requireString(match, key, label);

  if (typeof match[key] === "string" && !allowedValues.has(match[key])) {
    errors.push(`${label} has unsupported ${key} "${match[key]}".`);
  }
}

function validateKickoffUtc(match: JsonObject, label: string) {
  requireString(match, "kickoffUtc", label);

  if (typeof match.kickoffUtc !== "string") {
    return;
  }

  const parsed = new Date(match.kickoffUtc);
  if (!Number.isFinite(parsed.getTime()) || !match.kickoffUtc.endsWith("Z")) {
    errors.push(`${label} must have kickoffUtc as an ISO UTC datetime string.`);
  }
}

function validateOptionalString(match: JsonObject, key: "venue" | "city", label: string) {
  const value = match[key];

  if (value !== undefined && typeof value !== "string") {
    errors.push(`${label} has an invalid ${key}; use a string or omit it.`);
  }
}

function validateTeamReference(
  match: JsonObject,
  key: "homeTeamId" | "awayTeamId",
  teamIds: Set<string>,
  label: string
) {
  const teamId = match[key];

  if (teamId === undefined) {
    return;
  }

  if (typeof teamId !== "string" || teamId.trim() === "") {
    errors.push(`${label} has an invalid ${key}.`);
    return;
  }

  if (!teamIds.has(teamId)) {
    errors.push(`${label} references unknown ${key} "${teamId}".`);
  }
}

function getMatchLabel(match: unknown, index: number) {
  if (isObject(match) && typeof match.id === "string" && match.id.trim() !== "") {
    return `match "${match.id}"`;
  }

  return `matches[${index}]`;
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null;
}
