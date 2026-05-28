# Changelog

All notable changes to ID Lens will be documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning follows
[SemVer](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-05-28

### Added

- Universal identifier inspector with auto-detection across 23 supported
  formats.
- Decoders for UUID v1 / v3 / v4 / v5 / v6 / v7 / v8, Nil UUID, Max UUID,
  ULID, KSUID, MongoDB ObjectId, Snowflake (Twitter / X, Discord,
  Instagram), NanoID, TSID, Xid, CUID v1, CUID v2, Stripe-style IDs,
  Firebase push IDs, Sqids / Hashids (recognition only), and Unix
  timestamps in seconds / milliseconds / microseconds / nanoseconds.
- Visual byte-layout strip with per-segment color taxonomy on every
  format that has a meaningful binary structure.
- Examples library with one-click load into the Inspector.
- Batch tab for analysing many identifiers at once in a table view.
- Generators for UUID v4, UUID v7, ULID, KSUID, MongoDB ObjectId, and
  NanoID, with copy-to-clipboard and "Inspect this" shortcuts.
- Dark and light themes, persisted across reloads.
- Full keyboard navigation, ARIA roles on tabs and live regions,
  visible focus rings on every interactive element.
- Strict Content Security Policy (no inline scripts, no external
  connections at runtime).

### Properties of v1.0.0

- 100% client-side. After the initial page load the app makes no
  network requests.
- No telemetry, no analytics, no cookies.
- Bundle size: 60 KB JS (20 KB gzipped), 16 KB CSS (4 KB gzipped).
- 82 unit tests pass; 0 lint errors.
