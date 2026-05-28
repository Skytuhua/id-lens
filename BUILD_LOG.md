# Build Log

A running diary of decisions, dead ends, and fixes. Newest at top.

## 2026-05-28

### Phase 0 — Environment

- Confirmed toolchain: Node 22, npm 10, Python 3.11, Go, Rust, Docker, Playwright.
- Installed `gh` CLI (was missing). Verified GitHub auth as `Skytuhua` with
  full `repo` scope.
- Disk: 30 GB free. Memory: 15 GB. Network: open (github, npm, pypi all 200).

### Phase 1 — Research

- Searched for the state of ID-decoding tools.
- Found `Racum/uuinfo` and `zcyc/idinfo` (CLI) covering the comprehensive
  decoding space well, and `uuidtools.com` covering UUIDs only in the browser.
- Confirmed no popular browser tool spans UUID + ULID + KSUID + Snowflake
  variants + ObjectId + Stripe + others with auto-detection.
- Scored five candidate ideas against the rubric in the master prompt.
- Selected **ID Lens** (universal identifier inspector).

### Phase 2 — Scaffolding

- Created `/home/user/workspace/id-lens/`, `git init`, branch `main`.
- Configured local git identity for this repo.
- Wrote `RESEARCH.md`, `SPEC.md`, `ARCHITECTURE.md`, this log.

### Phase 3 — Dependencies

- Picked Preact + Vite + TypeScript for the smallest viable
  framework footprint.
- Pinned `vite@5.4.21` and `vitest@1.6.1` to patched versions to clear
  two dev-only `esbuild` advisories. The remaining moderate-severity
  `esbuild` advisories are dev-server only and never reach the
  production bundle.
- Adopted the Linear-app design language as the spec reference for
  `DESIGN.md`, then authored an original token set (own canvas, surface
  ladder, accent hue, segment palette, type scale, spacing rhythm).

### Phase 4 — Build

- Built all 13 decoders + the detection registry first, then 82
  unit tests — every decoder passed before the UI was wired.
- Bytes / Crockford base32 / base62 / time helpers live in `src/lib/`.
- UI implemented in 11 Preact components (App, Inspector, ResultCard,
  FieldRow, ByteLayout, CopyButton, Examples, Batch, Generators,
  About, ThemeToggle).
- Dark theme by default, light theme persisted in localStorage; nothing
  else is stored.
- Bundle size: 60 KB JS (20 KB gzipped), 16 KB CSS (4 KB gzipped) —
  comfortably under the 200 KB ceiling in `SPEC.md`.

### Phase 5 — Self-review

- Drove the app in Playwright headless Chromium at desktop (1280×900)
  and mobile (390×800), capturing 40 screenshots across dark and light
  themes.
- Found and fixed 7 distinct issues — see `REVIEW.md`. Highlights:
  NanoID matching every UUID, Discord docs example being mislabelled
  Twitter in batch view, future-dated Snowflake variants outranking past
  ones, quoted IDs / `urn:uuid:` prefix not matching, mobile field-row
  layout breakage on MAC addresses.
- Re-ran tests + lint + build after each fix.

### Phase 6 — Packaging

- Produced the production `dist/` output.
- Zipped a portable artifact (`id-lens-v1.0.0-dist.zip`, 26 KB).
- Verified the artifact loads cleanly via a fresh `python3 -m http.server`
  and produces identical screenshots to the dev preview.
