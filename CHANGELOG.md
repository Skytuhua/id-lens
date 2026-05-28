# Changelog

All notable changes to ID Lens will be documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning follows
[SemVer](https://semver.org/spec/v2.0.0.html).

## [2.0.0] — 2026-05-28

A full visual redesign — terminal-native TUI built on the same Preact/TS
decoder core. No new formats, no decoder regressions: 82/82 unit tests
still green. Everything below is presentational + a few new affordances.

### Changed

- **Aesthetic reset to a TUI / ncurses / xxd idiom.** Fixed-grid,
  monospace-everywhere, dark-only.
- **Accent moved from cool blue (`#7aa2ff`) to amber (`#e8a04a`).**
  Single-accent rule preserved.
- **Ink moved from cool gray to warm CRT-phosphor cream** (`#d8d2c4`).
- **Canvas tinted warmer** (`#0a0c10`).
- **Border-radius zeroed everywhere** — sharp rectangles only, no pills.
- **System mono replaced with JetBrains-Mono-first stack** (no `@import`;
  the system fallback still works if JetBrains Mono isn't installed —
  keeps the strict-no-network CSP intact).
- **Faint scanline overlay** (1.2% alpha, no animation, `overlay`
  blend-mode) under everything.
- **Hex dump becomes the centerpiece** of every byte-aligned result —
  two-row cross-section with Unicode leader brackets
  (`╰─ ── ── ─╯`) drawn under each contiguous segment + a per-segment
  legend below.
- **Confidence now renders as a 5-cell level meter** (high → 5/5,
  medium → 3/5, low → 1/5) plus the categorical label.
- **Field labels gained a square segment-color marker** that matches the
  byte-dump taxonomy.
- **Numbered tmux-style tabs** with hairline separators and an amber
  2-px underline on the active tab.
- **Permanent status bar** pinned to the viewport bottom: mode pill,
  length, format, confidence, and a non-removable privacy claim
  (`100% client-side · 0 network`).
- **Bracketed wordmark** `[ ID · LENS ] v2.0.0` plus a live UTC clock
  with an `ok-green` indicator.
- **Empty state** for the Inspector got a clear "Awaiting input." label,
  a one-line explanation, and a chip row of canonical try-me examples.
- **Parse-error state** got an err-red rail + uppercase "UNRECOGNISED"
  title.
- **Examples / Generators / Batch / About** all reskinned to match the
  TUI panels.

### Added

- **Keyboard shortcuts:** `1`-`5` switch tabs, `/` focuses the input,
  `?` toggles a help overlay, `Esc` blurs the input / closes the help.
- **Help overlay** (`?`) listing all bindings.
- **Multi-candidate disambiguation panel** under the primary result.
  Click any row to expand its full hex dump + field grid inline.

### Removed

- **Light mode.** The redesign commits to dark-only; the TUI idiom and
  the warm-ink palette don't translate. (The decoder API and tokens are
  still light-mode-friendly if a fork wants to bring it back.)
- **`ThemeToggle.tsx`** component.

### Properties of v2.0.0

- 100% client-side. No network requests after initial load.
- Bundle size: 63 KB JS (22 KB gzipped), 20 KB CSS (4.2 KB gzipped).
- 82 unit tests; 0 lint errors.
- Same Content Security Policy (`default-src 'self'`, no inline scripts,
  no external connections).
- All 23 supported formats from v1 still decode identically.

## [1.0.0] — 2026-05-28

Initial release. See git history `v1.0.0` tag.

### Added

- Universal identifier inspector with auto-detection across 23 supported
  formats: UUID v1 / v3 / v4 / v5 / v6 / v7 / v8, Nil and Max UUID,
  ULID, KSUID, MongoDB ObjectId, Snowflake (Twitter / X, Discord,
  Instagram), NanoID, TSID, Xid, CUID v1, CUID v2, Stripe-style IDs,
  Firebase push IDs, Sqids / Hashids (recognition), Unix timestamps
  in s / ms / µs / ns.
- Visual byte-layout strip on every byte-aligned format.
- Inspector / Examples / Batch / Generators / About tabs.
- Dark + light themes, persisted in localStorage.
- Strict Content Security Policy.
