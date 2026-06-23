# AGENTS.md

## Project
Static World Cup 2026 tracker for GitHub Pages.

Live:
https://alexrud1993.github.io/fifa-world-cup-2026-tracker/

## Rules
- No API keys.
- No backend.
- No database.
- No runtime external football fetches.
- Local JSON is source of truth.
- Keep current match schema: kickoffUtc + venue + city.
- Do not migrate to dateUtc + venueId + venues.
- Do not add heavy UI libraries.
- Do not use official FIFA logos/branding.

## Stack
Vite, React, TypeScript, CSS, Vitest, GitHub Actions.

## Data
Main file:
public/data/worldcup-2026.json

Data is a manually updated snapshot from public official tournament sources.

## Commands
Run before commit:
npm run data:validate
npm test
npm run build
BASE_PATH=/fifa-world-cup-2026-tracker/ npm run build

## Design direction
Dark football dashboard:
- black/charcoal background
- green pitch accents
- cards
- clear tables
- readable match cards
- mobile-first

## i18n
Supports:
- uk
- en

Rules:
- Default: Ukrainian.
- Translate UI labels.
- Do not translate real team names from JSON.
- Generated placeholders may be translated.

## Current priority
Mobile polish only:
1. true one-column mobile layout
2. hide nav scrollbar
3. readable match cards
4. UA/EN consistency

## Never commit
node_modules/
dist/
tsconfig.tsbuildinfo
.env
.env.local

## Report after work
- changed files
- commands run
- results
- remaining TODO
