import type { TournamentData } from "./types";

const DATA_URL = `${import.meta.env.BASE_URL}data/worldcup-2026.json`;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validateTournamentData(data: unknown): TournamentData {
  if (!isObject(data)) {
    throw new Error("Tournament data format is invalid.");
  }

  if (!Array.isArray(data.teams)) {
    throw new Error("Tournament data format is invalid.");
  }

  if (!Array.isArray(data.groups)) {
    throw new Error("Tournament data format is invalid.");
  }

  if (!Array.isArray(data.matches)) {
    throw new Error("Tournament data format is invalid.");
  }

  return data as unknown as TournamentData;
}

export async function loadTournamentData(): Promise<TournamentData> {
  let response: Response;

  try {
    response = await fetch(DATA_URL);
  } catch {
    throw new Error("Could not load tournament data.");
  }

  if (!response.ok) {
    throw new Error("Could not load tournament data.");
  }

  try {
    const json = (await response.json()) as unknown;
    return validateTournamentData(json);
  } catch (error) {
    if (error instanceof Error && error.message === "Tournament data format is invalid.") {
      throw error;
    }

    throw new Error("Tournament data format is invalid.");
  }
}
