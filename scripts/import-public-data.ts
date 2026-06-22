import { normalizePublicData, writeNormalizedPublicData } from "./normalize-public-data.ts";

const PUBLIC_DATA_URL = process.env.PUBLIC_DATA_URL ?? "";

if (!PUBLIC_DATA_URL.trim()) {
  console.log("No public data URL configured. Skipping optional import.");
  process.exit(0);
}

try {
  const response = await fetch(PUBLIC_DATA_URL);

  if (!response.ok) {
    console.warn(`Optional public import skipped: ${response.status} ${response.statusText}`);
    process.exit(0);
  }

  const remoteData = (await response.json()) as unknown;
  const normalized = await normalizePublicData(remoteData, PUBLIC_DATA_URL);

  await writeNormalizedPublicData(normalized);
  console.log("Optional public data imported to public/data/imported-worldcup-2026.json");
} catch (error) {
  console.warn(
    error instanceof Error
      ? `Optional public import skipped: ${error.message}`
      : "Optional public import skipped: unknown error."
  );
  process.exit(0);
}
