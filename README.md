# Torlink Web

Web adaptation of [baairon/torlink](https://github.com/baairon/torlink), based on its MIT-licensed v1.11.0 search adapters. A Cloudflare Worker serves the interface and same-origin search endpoints. Torrent transfer stays in the visitor's installed client.

## Build and check

Use Node 24.22.1 or later, then `npm ci`, `npm run build`, and `npm test`.
The deployable Worker is `dist/server/index.js`; the manifest is `.openai/hosting.json`.

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
