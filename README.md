# FIFA World Cup 2026 Tracker

Static Vite + React + TypeScript app for a FIFA World Cup 2026 tracker.

## Project Rules

- No API keys
- No backend
- No server-side database
- No external football API calls in the core app
- Tournament data lives in `public/data/worldcup-2026.json`

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm test
npm run data:validate
npm run data:import-public
npm run data:normalize-public
```

## Local Development

Run the site locally with:

```bash
npm run dev
```

The app is static. It reads only from `public/data/worldcup-2026.json`; there are no API keys, no backend, and no required remote football API calls.

## Manual Data Updates

All tournament data is edited manually in `public/data/worldcup-2026.json`.

The current `worldcup-2026.json` file contains demo starter data so the published static site can show finished matches, fixed scores, and calculated standings before real tournament data is entered. Demo scores are not official. Replace them manually when trusted real fixtures and results are available.

### Source-of-truth match schema

The app intentionally uses this working match schema. Keep `kickoffUtc`, `venue`, and `city` as the canonical fields. Do not migrate match dates to `dateUtc`, and do not require `venueId` or a `venues` array before publication.

```json
{
  "id": "string",
  "stage": "group | round-of-32 | round-of-16 | quarter-final | semi-final | third-place | final",
  "groupId": "optional string",
  "kickoffUtc": "ISO UTC datetime string",
  "venue": "optional string",
  "city": "optional string",
  "homeTeamId": "optional string",
  "awayTeamId": "optional string",
  "homePlaceholder": "optional string",
  "awayPlaceholder": "optional string",
  "status": "scheduled | live | finished | postponed | cancelled",
  "homeScore": "optional number",
  "awayScore": "optional number",
  "winnerTeamId": "optional string"
}
```

To add a scheduled match, add an object to the `matches` array:

```json
{
  "id": "group-a-3",
  "stage": "group",
  "groupId": "A",
  "homeTeamId": "a1",
  "awayTeamId": "a3",
  "kickoffUtc": "2026-06-16T22:00:00Z",
  "venue": "Lumen Field",
  "city": "Seattle",
  "status": "scheduled"
}
```

To enter a score manually, add `homeScore` and `awayScore` to the match:

```json
"homeScore": 2,
"awayScore": 1
```

To mark a match as finished, set `status` to `"finished"` and make sure both scores are numbers:

```json
{
  "id": "group-a-3",
  "stage": "group",
  "groupId": "A",
  "homeTeamId": "a1",
  "awayTeamId": "a3",
  "kickoffUtc": "2026-06-16T22:00:00Z",
  "venue": "Lumen Field",
  "city": "Seattle",
  "status": "finished",
  "homeScore": 2,
  "awayScore": 1
}
```

If you use `homeTeamId` or `awayTeamId`, that team ID must exist in the `teams` array. For unknown teams in knockout rounds, use `homePlaceholder` and `awayPlaceholder`.

## Validate Data

After editing JSON, run:

```bash
npm run data:validate
```

The validator checks the local JSON file, prints clear errors, exits with code `1` on failure, and exits with code `0` on success.

## Optional Public Data Import

The tracker can optionally import public no-auth JSON into `public/data/imported-worldcup-2026.json`. This is isolated by design: `public/data/worldcup-2026.json` remains the safe main source of truth, and the app does not depend on remote data.

No API keys, secrets, paid APIs, backend, or remote fetches are required for the core app.

The import URL is plain configuration. Set `PUBLIC_DATA_URL` in your shell or edit the `PUBLIC_DATA_URL` value in `.github/workflows/import-public-data.yml`. Leave it empty to skip importing safely.

```bash
npm run data:import-public
```

If the URL is empty, unavailable, or returns invalid JSON, the import script exits without changing the main local data file.

To create a normalized comparison file from the current local data, run:

```bash
npm run data:normalize-public
```

After an import, compare `public/data/imported-worldcup-2026.json` with `public/data/worldcup-2026.json` and manually copy only the updates you trust.

The optional workflow `.github/workflows/import-public-data.yml` can be run manually and also runs once per day. It commits `imported-worldcup-2026.json` only when that file changes.

## Structure

```text
src/
  app/
  components/
  pages/
  lib/
  styles/

public/
  data/

tests/
```

## GitHub Pages Deployment

The app deploys the `dist/` folder with the official GitHub Pages Actions workflow in `.github/workflows/deploy.yml`. The workflow validates local data, runs tests when test files exist, builds with `npm run build`, and publishes the static output without API secrets or API key placeholders.

For repository project pages, the workflow passes the repository name to Vite as `BASE_PATH`, so built asset URLs work under `https://OWNER.github.io/REPOSITORY/`.

1. Push this repository to GitHub.
2. Open the repository Settings.
3. Go to Pages.
4. Select GitHub Actions as the source.
5. Push to `main`.
6. Open the deployed site URL shown on the Pages screen or in the workflow summary.
