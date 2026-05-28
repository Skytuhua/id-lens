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
