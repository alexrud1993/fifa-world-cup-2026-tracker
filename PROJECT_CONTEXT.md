# PROJECT_CONTEXT

## Project
Static World Cup 2026 tracker.

Live:
https://alexrud1993.github.io/fifa-world-cup-2026-tracker/

Repo:
https://github.com/alexrud1993/fifa-world-cup-2026-tracker

## Stack
Vite + React + TypeScript + CSS + Vitest + GitHub Pages.

## Current status
Published and working.

Current data snapshot:
- 48 teams
- 12 groups
- 104 matches
- 41 finished
- 63 scheduled
- source of truth: public/data/worldcup-2026.json

## Hard rules
- No API keys.
- No backend.
- No database.
- No runtime live-score fetch.
- Local JSON is source of truth.
- Keep schema: kickoffUtc + venue + city.
- Do not migrate to dateUtc + venueId + venues.

## Main files
- public/data/worldcup-2026.json
- src/lib/i18n.ts
- src/lib/dates.ts
- src/lib/standings.ts
- src/lib/knockout.ts
- src/components/
- src/pages/
- src/styles/
- .github/workflows/deploy.yml

## Commands before commit
npm run data:validate
npm test
npm run build
BASE_PATH=/fifa-world-cup-2026-tracker/ npm run build

## Current priorities
1. Mobile layout polish.
2. Header mobile nav cleanup.
3. Match card readability on phone.
4. UA/EN consistency.
5. Keep design close to dark football dashboard reference.

## Do not start without request
- Backend.
- API integration.
- Data schema migration.
- PWA.
- Full tie-breakers.
- Knockout auto-fill.
- Full rewrite.
