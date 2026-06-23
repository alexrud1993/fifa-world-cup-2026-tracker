import { appendFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";
import { pathToFileURL } from "node:url";
import type { Match, TournamentData } from "../src/lib/types.ts";

const LOCAL_DATA_PATH = join(cwd(), "public", "data", "worldcup-2026.json");
const DEFAULT_BEFORE_MINUTES = 15;
const DEFAULT_AFTER_MINUTES = 150;

export interface LiveWindowOptions {
  beforeMinutes?: number;
  afterMinutes?: number;
}

export function findLiveUpdateCandidates(
  matches: Match[],
  now = new Date(),
  options: LiveWindowOptions = {}
) {
  const beforeMs = (options.beforeMinutes ?? DEFAULT_BEFORE_MINUTES) * 60_000;
  const afterMs = (options.afterMinutes ?? DEFAULT_AFTER_MINUTES) * 60_000;
  const nowMs = now.getTime();

  return matches.filter((match) => {
    if (match.status === "live") {
      return true;
    }

    if (match.status !== "scheduled") {
      return false;
    }

    const kickoffMs = new Date(match.kickoffUtc).getTime();
    if (!Number.isFinite(kickoffMs)) {
      return false;
    }

    return nowMs >= kickoffMs - beforeMs && nowMs <= kickoffMs + afterMs;
  });
}

export function shouldRunFifaImport(
  data: TournamentData,
  mode: "hourly" | "live",
  now = new Date()
) {
  if (mode === "hourly") {
    return {
      shouldRun: true,
      reason: "hourly update"
    };
  }

  const candidates = findLiveUpdateCandidates(data.matches, now);

  return {
    shouldRun: candidates.length > 0,
    reason: candidates.length > 0
      ? `live update window for ${candidates.map((match) => match.id).join(", ")}`
      : "no match in live update window"
  };
}

async function runCli() {
  const mode = parseMode(process.argv[2] ?? process.env.UPDATE_MODE);
  const now = process.env.NOW_ISO ? new Date(process.env.NOW_ISO) : new Date();
  const data = await readJsonFile<TournamentData>(LOCAL_DATA_PATH);
  const result = shouldRunFifaImport(data, mode, now);

  await writeGithubOutput({
    reason: result.reason,
    should_run: result.shouldRun ? "true" : "false",
    update_mode: mode
  });

  console.log(`${result.shouldRun ? "Will run" : "Skipping"} FIFA ${mode} import: ${result.reason}.`);
}

async function readJsonFile<T>(path: string): Promise<T> {
  const file = await readFile(path, "utf-8");
  return JSON.parse(file) as T;
}

function parseMode(value: string | undefined): "hourly" | "live" {
  return value === "live" ? "live" : "hourly";
}

async function writeGithubOutput(values: Record<string, string>) {
  if (!process.env.GITHUB_OUTPUT) {
    return;
  }

  const lines = Object.entries(values).map(([key, value]) => `${key}=${value}`);
  await appendFile(process.env.GITHUB_OUTPUT, `${lines.join("\n")}\n`, "utf-8");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Failed to decide FIFA import mode.");
    process.exit(1);
  });
}
