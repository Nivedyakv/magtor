# Torlink Web

Web adaptation of [baairon/torlink](https://github.com/baairon/torlink), based on its MIT-licensed v1.11.0 search adapters. Vercel serves the static interface and a Node.js serverless function handles same-origin search endpoints. A Cloudflare Worker build is also retained. Torrent transfer stays in the visitor's installed client.

## Build and check

Use Node.js 22.x, then `npm ci`, `npm run build`, and `npm test`.
The build creates `.vercel/output` using Vercel Build Output API v3. The existing Sites Worker is also generated at `dist/server/index.js`.

## Deploy to Vercel

Import this repository into Vercel with the repository root as the Root Directory. Use the **Other** framework preset, **Node.js 22.x**, and the build command `npm run build` (configured in `vercel.json`). Leave the Output Directory override disabled: Vercel consumes `.vercel/output` automatically. No environment variables or database setup are required.

The homepage is served statically. `/api/search` and `/api/sources` route to a bundled Node.js function with a 30-second maximum duration, allowing the existing 18-second provider timeout to finish. Search requests remain same-origin, so no CORS configuration is needed. The five-minute provider cache is best-effort and local to each warm function instance.

After deployment, search for `Big Buck Bunny` with The Pirate Bay Movies enabled, and verify that a result opens a magnet dialog. `/api/sources` should return the provider list. Provider restrictions can differ between your Vercel region and the development environment.

## Features

- Search 8 provider adapters across Movies, TV, Anime and Games.
- Results stream into the UI per provider; 18-second provider deadline, explicit failures, five-minute bounded per-isolate cache.
- Dedupe by info hash and combine trackers; sort and filter available results.
- Inspect, copy, open and locally save magnet links.
- Accept existing magnets and hex/base32 BitTorrent v1 hashes.

## API

`GET /api/sources` lists providers. `GET /api/search?source=nyaa&q=title` returns `{ok, source, results, error?}`. Source must be a known adapter ID. Direct magnet/hash queries return a normalized direct result. Query maximum: 300 characters. No arbitrary URL fetching endpoint is exposed.

## Analysis and attribution

REA analyzed the published torlnk 1.11.0 npm artifact using `rea analyze-javascript-application /absolute/package/path --json`. See `REA-evidence-summary.json` and `ANALYSIS.md`. The source was also inspected to preserve provider-specific behavior. Original code and attribution are in `src/upstream/` and `LICENSE-torlink`.

## Limits

Providers may be offline, blocked or return no results; availability varies by runtime and region. EZTV title lookup is limited by its recent index. SubsPlease and FitGirl do not report swarm counts. Unknown seed counts are displayed as unknown and retained by the seeder filter. Search queries go through the site's server to external providers. Saved links live in localStorage on the current browser. No torrent payloads are downloaded, stored or seeded by this site.

Automated checks cover routes, frontend syntax, magnet parsing, hash normalization, source mapping, and provider failure handling. Browser visual/interaction QA was unavailable because the managed browser tool was absent.

## Design and Codex skill

The interface follows the project-scoped `apple-design` Codex skill installed at `.agents/skills/apple-design/SKILL.md`, sourced from [Emil Kowalski’s skills repository](https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md). Its original MIT license is preserved beside the skill. Codex discovers it when working in this repository.

The UI uses system typography, restrained blue accents, translucent chrome, light/dark system themes, and interruptible critically damped dialog motion. Keyboard category navigation, native modal focus handling, reduced-motion, reduced-transparency and higher-contrast preferences are supported. No frontend runtime dependency was added.

The motion checks exercise dismissal, interruption/reopening, and reduced-motion behavior. Visual browser QA remains unverified because the managed browser tool was unavailable.
