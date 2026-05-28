# ID Lens — Product Specification (v1.0.0)

## Product summary

A privacy-respecting, browser-based tool that decodes any identifier you paste
and explains what it is and what it contains. Single-page app, no backend,
no telemetry.

## Primary user flow

1. User opens the app.
2. User pastes an identifier into the input box.
3. The app auto-detects the most likely format(s) as the user types.
4. The app displays a structured breakdown: format name, fields (timestamp,
   counter, machine ID, environment, randomness, …), a visual byte layout,
   and a short explanation of the format.
5. User can copy any field with one click.
6. If the input matches multiple plausible formats, all candidates are listed
   with the most confident one expanded by default.

## Supported ID formats (v1)

Each format below is a hard requirement. "Decode" means: classify, extract
all defined fields, show byte layout, and produce a short explanation.

1. **UUID v1** — timestamp, clock_seq, node (MAC)
2. **UUID v3** — variant, namespace-hashed (no embedded data, format-confirm only)
3. **UUID v4** — variant, fully random (format-confirm only)
4. **UUID v5** — variant, namespace-hashed (format-confirm only)
5. **UUID v6** — reordered v1, timestamp, clock_seq, node
6. **UUID v7** — Unix-ms timestamp, random tail
7. **UUID v8** — custom / vendor-defined (format-confirm only)
8. **Nil UUID & Max UUID** — recognised explicitly
9. **ULID** — 48-bit timestamp + 80-bit randomness, Crockford base32
10. **KSUID** — 32-bit timestamp (custom epoch 2014-05-13) + 128-bit payload
11. **MongoDB ObjectId** — 4-byte timestamp + 5-byte random + 3-byte counter
12. **Snowflake (Twitter/X)** — 41-bit ms timestamp (epoch 2010-11-04) + 10-bit
    machine + 12-bit sequence
13. **Snowflake (Discord)** — 41-bit ms timestamp (epoch 2015-01-01) + 5-bit
    worker + 5-bit process + 12-bit increment
14. **Snowflake (Instagram)** — 41-bit ms timestamp (epoch 2011-09-09) +
    13-bit shard + 10-bit sequence
15. **NanoID** — length, alphabet inference, computed entropy
16. **TSID** — 42-bit ms timestamp (epoch 2020-01-01) + 22-bit random
17. **Xid** — 4-byte timestamp + 3-byte machine + 2-byte pid + 3-byte counter
18. **CUID v1** — fingerprint, timestamp, counter, randomness
19. **CUID v2** — length, format-confirm only (intentionally opaque)
20. **Stripe IDs** — object-type prefix (cus, pi, sub, sk_test_, …), live vs test mode
21. **Firebase push IDs** — 48-bit timestamp + 72-bit random (Base64-ish 20 chars)
22. **Sqids / Hashids style** — recognised by alphabet; decode if user supplies alphabet
23. **Unix timestamp** — seconds / ms / µs / ns; render as UTC ISO

## Required UI surfaces

1. **Inspector** (main tab): paste input, see decoded breakdown.
2. **Examples**: a library of pre-loaded example IDs across all formats, one
   click to inspect.
3. **Batch**: paste many IDs, one per line, get a table of (input → format → key field).
4. **Generators**: tiny generator panel for UUID v4, UUID v7, ULID, NanoID,
   KSUID, ObjectId. (Not the primary surface; supplementary.)
5. **About**: what it is, how it works, privacy stance, supported formats,
   how detection works, link to source.

## Required quality bars

- **Responsive** down to 360 px wide (single-column collapse).
- **Dark mode by default** with light-mode toggle persisted in localStorage.
- **Keyboard-friendly**: tab navigates between fields and copy buttons; `?` opens
  shortcut help.
- **Copy feedback**: every copy button gives a transient visual confirmation.
- **No layout shift** when results appear; reserved skeleton area.
- **Empty / error / success states** explicitly designed (not default browser styles).
- **Bundle size**: < 200 KB gzipped for the JS payload.
- **Cold-load TTI** under 1.5 s on a fresh load (no fonts blocking).

## Required automated tests

- Unit tests for each decoder using canonical example IDs from each format's spec.
- Auto-detection tests across the example library: every example detects to the
  correct format with the highest confidence.
- Edge-case tests: malformed length, invalid characters, off-by-one boundaries,
  case sensitivity (where formats are case-insensitive), trimming whitespace.
- Format-conflict resolution tests where multiple formats could theoretically match.

## Explicit non-goals

- No backend, no analytics, no telemetry, no account.
- No JWT decoding, signature verification, or hash inversion.
- No ID generation as the *primary* surface (only the small generators panel).
- No mobile-native app.
- No support for proprietary or undocumented enterprise ID formats.
- No "guess the language / framework" features.

## Definition of done (v1)

- All 23 formats above decode their canonical examples correctly.
- Auto-detection picks the correct format as the top candidate for every
  example in the library.
- Every UI surface (Inspector, Examples, Batch, Generators, About) is
  reachable, polished, and working.
- All advertised quality bars met.
- All tests green.
- A clean static-site build produces a working `dist/` that opens via a
  plain `index.html` file:// URL **and** via a static HTTP server.
- README, CHANGELOG, LICENSE, BUILD_LOG, REVIEW all present.
- Repo pushed to GitHub, tagged `v1.0.0`, with the zipped build attached
  as a release asset.
- (If feasible) GitHub Pages deployment live.
