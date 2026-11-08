# Torlink reconstruction notes

## Evidence

REA 6.8.0 was acquired from the official `rea-agents` npm package linked by morluto/rea. Its JavaScript application analyzer inspected the published `torlnk@1.11.0` package, without executing target code. The result inspected five relevant files, parsed four JavaScript files, and reported zero parse failures or integrity contradictions. The evidence ID and package SHA-256 are preserved in `REA-evidence-summary.json`. This static analysis does not establish live execution or network availability.

Readable upstream source was inspected separately to trace the actual search and magnet logic:

- `src/sources/registry.ts`: eight adapters with category and health metadata.
- `src/sources/*.ts`: HTTP APIs and RSS search. YTS mirrors; Nyaa RSS; SubsPlease resolution preference; APIBay category filtering; FitGirl paginated RSS; BitTorrented video-only query; EZTV recent-feed to IMDb ID lookup.
- `src/sources/magnet.ts`: tracker defaults, magnet preservation and base32 hash normalization.
- `src/ui/dedupe.ts`: healthiest hash result wins; trackers and missing metadata merge.
- `src/sources/cache.ts`: 100-entry cache, five-minute TTL.

## Web adaptation

The browser sends one same-origin request per selected provider, displaying successful results as they arrive. The Worker runs the source adapter with an 18-second timeout and returns explicit provider failures. Only known source IDs can be queried. Valid magnet results are retained. Source data is escaped before rendering; direct magnet and infohash input reuses the upstream parser.

No torrent engine, native addon, terminal UI or arbitrary upstream proxy is included. Magnet links open in the visitor's own client. Original MIT notices are retained.

## Verification

Six automated checks pass: inline script syntax; routes and method/input validation; hex/base32 normalization; magnet tracker preservation and malformed input handling; YTS response mapping; provider failures. Live endpoint probes reached APIBay, Nyaa and SubsPlease; YTS was blocked from the build environment. These probes do not guarantee production provider availability. Managed browser QA could not run because cua_repl.js was unavailable.
