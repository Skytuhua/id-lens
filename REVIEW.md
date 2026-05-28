# Self-Review Log

Findings discovered during the review pass and their resolutions.

## Review pass 1 — Functional + Visual

### Findings

1. **NanoID noise on UUIDs.** A canonical UUID also matched the NanoID
   decoder at "low" confidence because `[A-Za-z0-9_-]{4,64}` accepts UUID
   hyphens. Each result card surfaced an irrelevant NanoID block under
   every UUID. **Fix:** NanoID now explicitly rejects strings that match
   the UUID structural regex or the Stripe prefix shape, and `detectAll`
   drops all low-confidence candidates whenever a high-confidence match
   exists. (`src/decoders/nanoid.ts`, `src/decoders/index.ts`)

2. **Discord example misclassified as Twitter.** The documented Discord ID
   `175928847299117063` decodes as Twitter (2012-03-03) or Discord
   (2016-04-30) — both real dates. The top result was Twitter purely
   because of registration order. **Fix:** Snowflake variants are now
   ranked by date — past dates beat future dates, and among past dates the
   most recent wins (Discord post-dates Twitter's epoch, Instagram post-
   dates that, so newer services surface for newer-era IDs). The
   ambiguity is preserved — all plausible variants still appear as
   alternatives, but the most likely one is on top. (`src/decoders/snowflake.ts`)

3. **Future-dated Snowflakes outranking past ones.** With the system
   clock at 2026-05-28, `1541815603606036480` decoded as Discord
   (2026-08-25, future) over Twitter (2022-06-28, past). A "future"
   identifier should not be more plausible than a past one. **Fix:** sort
   prefers past dates over future dates regardless of recency.
   (`src/decoders/snowflake.ts`)

4. **Discord doc ID misclassified as Unix-nanoseconds in batch.** An
   18-digit Snowflake also matches the Unix timestamp decoder (as
   nanoseconds). Both were "medium" confidence. **Fix:** Unix timestamp
   confidence is now `medium` only at canonical lengths 10 (seconds) and
   13 (ms); other lengths return `low`. Snowflakes at canonical 17-19
   digit length with a recent decoded date now return `high`. The
   confidence assigned in `decode()` matches the value returned from
   `matches()` so sort + UI agree.
   (`src/decoders/unixtime.ts`, `src/decoders/snowflake.ts`)

5. **Tiny numerics matched as Snowflakes.** `0`, `1`, and `12345` were
   passing through `decodeAllSnowflakeVariants` because the length check
   lived only in `snowflakeDecoder.matches`, not in the all-variants
   path used by `detectAll`. **Fix:** length and bit-width guards moved
   into `decodeAllSnowflakeVariants`. (`src/decoders/snowflake.ts`)

6. **Quoted IDs and `urn:uuid:` prefixes didn't match.** Pasting
   `"6ba7b810-..."` or `urn:uuid:6ba7b810-...` produced "no format
   matched". The `stripWrap` helper existed in `lib/bytes.ts` but was
   never called from `detectAll`. **Fix:** `detectAll` now calls
   `stripWrap` on its input. Tests added.
   (`src/decoders/index.ts`, `tests/detect.test.ts`)

7. **Awkward mobile layout under field rows.** On 390px viewports the
   MAC address (`00:c0:4f:d4:30:c8`) interleaved with its hint text
   because the value+hint flex container was wrapping across the colons.
   **Fix:** at `max-width: 720px` the field-value switches to
   `flex-direction: column` so the hint stacks under the value. Long mono
   values still break correctly within their column. (`src/styles.css`)

### Verification

- Re-ran `npm test` → 82/82 green.
- Re-captured 10 desktop and 10 mobile screenshots in dark theme, plus 10 of
  each in light theme — 40 screenshots total. Compared against
  `DESIGN.md` tokens: ink/muted/subtle text hierarchy, accent reserved for
  the active tab + focus rings + format pill + the lens glyph, segment
  colors only on byte cells and field values, hairlines instead of
  shadows, no decorative gradients other than the documented page glow.
- Verified the no-match red-rule state, the empty state, and the
  warning state (Stripe API key) all render distinctly.

## Review pass 2 — Code quality & security

### Findings & resolutions

1. **No `console.log` left in production code.** ESLint rule
   `no-console` enforces `warn` and `error` only.
2. **Empty `catch {}` blocks** flagged by lint in `App.tsx` for
   `localStorage` access. **Fix:** added explanatory comments.
3. **CSP locked down in index.html.** `default-src 'self'`, no inline
   scripts (only inline styles, which Vite emits as a single block),
   `connect-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`.
4. **No external runtime requests.** Verified by reading the built
   bundle and the network panel during the screenshot pass — only the
   initial HTML/CSS/JS load, nothing else.
5. **No secrets in repo.** Verified `.gitignore` covers `.env*` and
   `node_modules`; the GitHub token is held only in `~/.gh_token` and
   never written into the repo.
6. **Dependency audit.** Two moderate-severity `esbuild` advisories
   remain via the dev-server toolchain. They are dev-only (they require
   running `vite dev` while browsing a malicious site simultaneously)
   and never reach production. Documented; no production user impact.

## Review pass 3 — "Would a real user keep this?"

The target user pastes an ID they don't recognise into ID Lens, sees the
format named within ~200ms, sees fields they can copy, sees a link to
the spec, and walks away knowing what they looked at. The Inspector
tab handles single inspections. The Batch tab handles cleaning up a
column of mystery IDs. The Examples tab teaches the user what each
format looks like. The Generators tab supports the most common "give
me a fresh one" workflow.

What's missing from a v1 perspective:

- No JWT decoding — explicit non-goal, by design.
- No history of recently inspected IDs — privacy stance + explicit non-
  goal.
- No "convert between formats" tool — orthogonal and rare; not v1.

I'd ship this. It does the niche job well and does not try to be more
than that.

---

## v2.0.0 — TUI redesign review

After porting the externally-commissioned redesign onto the existing
Preact / TS / Vite stack, I drove the app through every state again in
headless Chromium at desktop (1280×900) and mobile (390×800). 22
screenshots captured. Decoder unit tests still pass 82/82; lint clean;
production build 63 KB JS / 22 KB gzipped.

### Findings during this pass

1. **Screenshot script referenced old DOM selectors.** The redesign
   replaced `.app-header` (cool-blue header) with `.titlebar` and dropped
   the theme toggle entirely. The Playwright flow timed out waiting for
   `.app-header`. **Fix:** rewrote `review/screenshot.mjs` to point at
   `.titlebar`, fill via a robust JS setter (so React-style input
   tracking fires), removed the light-theme pass (light mode dropped),
   and added a screenshot of the new `?` help overlay.

2. **Snowflakes had no hex-dump in the new card layout.** The redesign
   makes the hex dump central; Snowflake results didn't render one
   because `snowflakeDecoder.decode()` omits the `layout` field, and the
   `ResultCard` skips the dump when `layout` is missing. I considered
   adding a byte-level layout for Snowflakes but rejected it: Snowflakes
   pack bits within bytes (41 + 10 + 12 or 41 + 13 + 10 depending on
   vendor), so coloring each byte by one segment would be misleading.
   The field grid + per-label segment markers carry the bit-level
   structure cleanly. Snowflakes intentionally render without the dump;
   every byte-aligned format keeps it.

3. **Status bar mid-content in full-page screenshots.** A Playwright
   quirk: `fullPage: true` doesn't pin `position: fixed` elements. They
   appear at their original viewport position in the captured PNG, not
   pinned to the canvas bottom. In a real browser the bar is correctly
   pinned. The captured screenshots show this behaviour and it's
   harmless. The `.shell` element has `padding-bottom: 80px` so the
   pinned bar never overlaps the last content row in the live page.

4. **No light-mode regressions.** Confirmed by deleting the
   `data-theme='light'` rules and forcing `dark` in `App.tsx`'s mount
   effect. No styles referenced the light tokens.

### Verification artefacts

- `review/screenshots/desktop-01-inspector-empty.png` — clean empty
  state with example chip row.
- `desktop-02-inspector-uuid-v1.png` — full hex-dump cross-section,
  segment-colored leader brackets, per-label markers.
- `desktop-03-inspector-ulid.png` — two-segment (time + rand) leader
  bracket art, ULID-spec link.
- `desktop-04-inspector-snowflake-ambiguous.png` — primary Twitter
  result + "OTHER CANDIDATES — 2" collapsed list (Discord, Instagram).
- `desktop-05-inspector-stripe-test-key.png` — Stripe object-type
  decode + key warning.
- `desktop-06-inspector-no-match.png` — err-red rail + UNRECOGNISED.
- `desktop-07-examples.png`, `desktop-08-batch.png`,
  `desktop-09-generators.png`, `desktop-10-about.png` — all four other
  tabs in the TUI idiom.
- `desktop-11-help-overlay.png` — `?` modal showing all key bindings.
- Mobile (390 px) counterparts for every state — single-column
  collapse working correctly.

### "Would a real user keep this?" — round 2

The TUI direction is risky in that it can feel cosplay if executed
shallowly. This one doesn't — the hex-dump cross-section delivers real
visual information (which bytes hold which fields, color-coded, with
leader-line art that maps to the field grid below). The status bar
makes the privacy claim ambient instead of just documented. The
keyboard idiom (`1`-`5`, `/`, `?`) matches the audience.

Identifier work happens in terminals. This tool now looks like an
extension of that workflow rather than a generic webapp. I'd ship it.
