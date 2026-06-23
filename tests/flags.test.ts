import { describe, expect, it } from "vitest";

import { getFlagCodeForTeamCode } from "../src/lib/flags";

describe("flag mapping", () => {
  it("maps FIFA team codes to local SVG flag filenames", () => {
    expect(getFlagCodeForTeamCode("MEX")).toBe("mx");
    expect(getFlagCodeForTeamCode("SCO")).toBe("gb-sct");
    expect(getFlagCodeForTeamCode("ENG")).toBe("gb-eng");
  });

  it("returns null for unknown team codes", () => {
    expect(getFlagCodeForTeamCode("XXX")).toBeNull();
  });
});
