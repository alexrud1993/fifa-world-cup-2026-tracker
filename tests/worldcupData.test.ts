import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { TournamentData } from "../src/lib/types";

describe("worldcup-2026 starter data", () => {
  it("uses local editable JSON with groups, teams and matches", async () => {
    const file = await readFile(join(process.cwd(), "public", "data", "worldcup-2026.json"), "utf-8");
    const data = JSON.parse(file) as TournamentData;

    expect(data.tournament.name).toBe("FIFA World Cup 2026");
    expect(data.tournament.timezone).toBe("Europe/Kyiv");
    expect(typeof data.tournament.lastUpdated).toBe("string");
    expect(Array.isArray(data.groups)).toBe(true);
    expect(data.teams.length).toBeGreaterThan(0);
    expect(data.matches.length).toBeGreaterThan(0);
  });
});
