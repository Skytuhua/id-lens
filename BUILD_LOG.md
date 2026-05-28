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

## v2.0.0 — TUI redesign

A full visual reset commissioned externally. Direction lock-in: terminal-
native (TUI, ncurses, fixed-grid, very dense), dark-only, single amber
accent, avoid generic web design, must remain recognisably a developer
tool but much better.

### Approach

Taken from the redesign's INTEGRATION.md as Path B: keep the existing
Preact/TS decoder core and unit-test scaffolding completely intact —
the 82 unit tests stay green throughout — and replace only the visual
layer. The redesign was shipped as a React+Babel-CDN prototype; ported
each piece to Preact + TS, sharpened the typings, kept Vite + the
existing CSP and build pipeline.

### What landed

1. **Tokens rewritten** (`src/tokens.css`). Warmer canvas (#0a0c10),
   CRT-cream ink (#d8d2c4), amber accent (#e8a04a). Segment palette
   restated (`time / mach / seq / rand / ver / meta`). No light-mode
   counterpart — that theme is gone.
2. **`src/styles.css` replaced** with the TUI styleset. Scanline overlay,
   zero radius everywhere, box-drawing glyph support, sharp buttons.
3. **New TUI primitives**: `Titlebar` (with a live UTC clock), `TabBar`
   (numbered tmux idiom), `StatusBar` (pinned viewport-bottom), `Panel`,
   `ConfBar` (5-cell level meter), `HelpOverlay` (`?` modal).
4. **`ByteLayout` rebuilt** as a two-row hex-dump cross-section with
   Unicode leader brackets under each contiguous segment + a per-segment
   legend.
5. **`FieldRow` gained per-label segment-color markers** matching the
   byte-dump taxonomy.
6. **`Candidates` added** as a collapsible list under the primary
   result for ambiguous Snowflakes (click to expand full breakdown).
7. **Keyboard shortcuts wired in**: 1–5 / / ? Esc.
8. **Help overlay** listing all bindings.
9. **`Inspector`, `Examples`, `Batch`, `Generators`, `About` reskinned**.
10. **`ThemeToggle` removed**; light-theme `[data-theme='light']` rules
    deleted; the app force-sets `data-theme='dark'`.
11. **Bracketed wordmark** `[ ID · LENS ] v2.0.0` and a live UTC clock
    in the titlebar.

### Decisions worth flagging (departures from the prototype)

- **Kept system mono fallback only — no Google Fonts `@import`.**
  The CSS still asks for `JetBrains Mono` first, but the stack already
  falls back to system mono, and the strict-no-network CSP is preserved.
  The TUI feel is intact on common systems; the box-drawing glyphs
  render correctly in every system mono I tested.
- **Confidence label kept categorical (high / medium / low) instead of
  a percentage number.** The 5-cell bar already encodes the magnitude
  visually; the categorical label is what the decoder API actually
  returns, so showing both is honest about the source of truth.
- **Snowflakes have no hex-dump.** The byte-layout strip relies on
  byte-aligned segments. Snowflakes pack bits within bytes
  (41/10/12 or 41/13/10 bits depending on vendor), so a byte-level
  taxonomy would be misleading. The field grid carries the structure
  cleanly without it.

### Verification

- 82/82 unit tests still green.
- ESLint clean (0 errors).
- Production build: 63 KB JS (22 KB gzipped), 20 KB CSS (4.2 KB gzipped).
- 22 screenshots captured (11 desktop + 11 mobile) across every state:
  empty inspector, UUID v1, ULID, ambiguous Snowflake, Stripe test key,
  no-match, all four other tabs, help overlay.
- Hex-dump leader brackets render correctly in system mono.
- Status bar updates `MODE / LEN / FMT / CONF / PRIVACY` live as
  inputs change.

### Files changed

- Replaced: `src/tokens.css`, `src/styles.css`, `index.html`, every
  component except `CopyButton` (which was largely reused but updated
  for the new UPPERCASE `COPY` / `✓ COPIED` flash idiom).
- Added: `src/lib/segments.ts` (numeric → named segment mapping),
  `src/components/{Titlebar,TabBar,StatusBar,Panel,ConfBar,Candidates,HelpOverlay}.tsx`.
- Removed: `src/components/ThemeToggle.tsx`.
- Updated: `BUILD_LOG.md`, `CHANGELOG.md`, `README.md`, `REVIEW.md`,
  `DESIGN.md` (this section + the new token table).
- Decoders, decoder unit tests, examples library, and detection algorithm
  are unchanged from v1.0.0.
