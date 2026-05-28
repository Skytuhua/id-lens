# ID Lens

> **Paste any identifier. See what it is.**
>
> A privacy-respecting, browser-based universal identifier inspector.
> Auto-detects and decodes UUIDs, ULIDs, KSUIDs, Snowflakes (Twitter / Discord / Instagram),
> MongoDB ObjectIds, Stripe IDs, Firebase push IDs, TSIDs, Xids, CUIDs, Sqids,
> and Unix timestamps — all in a single page, 100% client-side, no telemetry.

![ID Lens — Inspector view](review/screenshots/desktop-02-inspector-uuid-v1.png)

## Why ID Lens

Every backend engineer, support engineer, and data analyst has stared at a
string of characters in a log file and thought *"what kind of ID is this?"*
There are great CLI tools for this ([`uuinfo`](https://github.com/Racum/uuinfo),
[`idinfo`](https://github.com/zcyc/idinfo)), but the browser options are
narrow — most decode only one format. ID Lens fills that gap: a single page
where you paste *anything* and immediately see what it is, what's inside it,
and where the spec lives.

## Supported formats

| Format | Recognised? | Decoded fields |
|---|---|---|
| **UUID v1** | ✅ | timestamp, clock_seq, node (MAC), version, variant |
| **UUID v3 / v5** | ✅ | algorithm (MD5 / SHA-1), version, variant |
| **UUID v4** | ✅ | version, variant |
| **UUID v6** | ✅ | reordered v1 timestamp, clock_seq, node |
| **UUID v7** | ✅ | Unix-ms timestamp, rand_a, rand_b |
| **UUID v8** | ✅ | custom (vendor-defined) payload |
| **Nil & Max UUID** | ✅ | sentinel labels |
| **ULID** | ✅ | 48-bit Unix-ms timestamp + 80-bit randomness |
| **KSUID** | ✅ | 32-bit timestamp (epoch 2014-05-13) + 128-bit payload |
| **MongoDB ObjectId** | ✅ | 4-byte timestamp + 5-byte process random + 3-byte counter |
| **Snowflake (Twitter / X)** | ✅ | epoch-shifted ms timestamp + datacenter + worker + sequence |
| **Snowflake (Discord)** | ✅ | epoch-shifted ms timestamp + worker + process + increment |
| **Snowflake (Instagram)** | ✅ | epoch-shifted ms timestamp + shard + sequence |
| **NanoID (default 21)** | ✅ | length, alphabet, entropy estimate |
| **TSID** | ✅ | 42-bit ms timestamp (epoch 2020-01-01) + 22-bit random |
| **Xid** | ✅ | timestamp + machine + PID + counter |
| **CUID v1** | ✅ | timestamp + counter + host fingerprint + random |
| **CUID v2** | ✅ | recognised; v2 is opaque by design |
| **Stripe-style IDs** | ✅ | prefix → object type, live / test mode, key warnings |
| **Firebase push IDs** | ✅ | 48-bit Unix-ms timestamp + 72-bit random |
| **Sqids / Hashids** | ✅ | recognised only — decoding needs the issuer's alphabet & salt |
| **Unix timestamp** | ✅ | seconds, milliseconds, microseconds, nanoseconds |

When more than one format plausibly matches, ID Lens shows every candidate
ranked by confidence rather than guessing.

## Privacy

- **100% client-side.** After the initial download of HTML/CSS/JS, the
  app makes **no network requests**.
- **No telemetry**, no analytics, no cookies. The identifier you paste
  never leaves your browser.
- **No local storage of inputs** — only your theme preference is persisted.
- Strict Content Security Policy (`default-src 'self'`, `connect-src 'self'`,
  `frame-ancestors 'none'`).

## Try it

- Open the deployed app: [`https://Skytuhua.github.io/id-lens`](https://Skytuhua.github.io/id-lens)
  *(may take a minute to publish after a release)*
- Or open the `dist/index.html` from a downloaded release artifact directly
  in any modern browser — it works from a `file://` URL.

## Quick examples

| Paste this | Get this |
|---|---|
| `6ba7b810-9dad-11d1-80b4-00c04fd430c8` | UUID v1, 1998-02-04, MAC `00:c0:4f:d4:30:c8` |
| `01ARZ3NDEKTSV4RRFFQ69G5FAV` | ULID, 2016-07-30 |
| `507f1f77bcf86cd799439011` | MongoDB ObjectId, 2012-10-17 |
| `175928847299117063` | Snowflake (Discord), 2016-04-30 |
| `cus_NeZwdNtLEOXuvB` | Stripe Customer object |
| `sk_test_FAKEexample00000000000000` | Stripe **test-mode** Secret API Key |
| `9m4e2mr0ui3e8a215n4g` | Xid |
| `1700000000` | Unix seconds: 2023-11-14 |

## Tabs

- **Inspector** — paste an ID, see the breakdown.
- **Examples** — one-click load of a curated example for every format.
- **Batch** — paste many identifiers, one per line, see them tabulated.
- **Generators** — fresh UUID v4 / v7, ULID, KSUID, ObjectId, NanoID.
- **About** — privacy stance, supported formats, links to specs.

## Run locally

```sh
git clone https://github.com/Skytuhua/id-lens.git
cd id-lens
npm install
npm run dev       # http://localhost:5173
```

Other scripts:

| Command            | What it does                                       |
|--------------------|----------------------------------------------------|
| `npm run build`    | Type-check + production build into `dist/`        |
| `npm run preview`  | Serve the production build at `http://localhost:4173` |
| `npm test`         | Run the full Vitest unit-test suite               |
| `npm run lint`     | ESLint over `src/` and `tests/`                   |
| `npm run format`   | Prettier write                                    |

Building produces a static `dist/` directory you can deploy to any host
(GitHub Pages, Netlify, Vercel, S3, …) or open directly via `file://`.

## Architecture (short version)

- **Stack:** Vite + TypeScript + Preact (~3 KB runtime). System fonts only.
- **Decoders** live in `src/decoders/*.ts`, one file per format. Each
  exports a `Decoder` with a `matches(input)` probe and a `decode(input)`
  function returning a structured `DecodeResult`.
- **Detection** (`src/decoders/index.ts`) runs every decoder's `matches`,
  collects candidates, sorts by confidence, suppresses low-confidence
  noise when a high-confidence match exists, and expands Snowflake into
  all plausible vendor variants ranked by date plausibility.
- **UI** is a small set of Preact components in `src/components/`.

Detailed design notes live in [`ARCHITECTURE.md`](./ARCHITECTURE.md),
[`SPEC.md`](./SPEC.md), and [`DESIGN.md`](./DESIGN.md).

## Screenshots

| | |
|---|---|
| ![Inspector — UUID v1](review/screenshots/desktop-02-inspector-uuid-v1.png) | ![Inspector — ULID](review/screenshots/desktop-03-inspector-ulid.png) |
| ![Inspector — ambiguous Snowflake](review/screenshots/desktop-04-inspector-snowflake-ambiguous.png) | ![Inspector — Stripe test key](review/screenshots/desktop-05-inspector-stripe-test-key.png) |
| ![Examples library](review/screenshots/desktop-07-examples.png) | ![Batch decode](review/screenshots/desktop-08-batch.png) |
| ![Generators](review/screenshots/desktop-09-generators.png) | ![About](review/screenshots/desktop-10-about.png) |

Mobile and light-theme screenshots live in `review/screenshots/` and
`review/screenshots-light/`.

## Limitations / non-goals

- **No JWT decoding or signature verification.** JWTs are a separate
  problem with their own (excellent) tools.
- **No hash inversion.** Impossible by design.
- **No server-side lookups.** ID Lens does not call out to anything.
- **Sqids / Hashids decoding** requires the issuer's alphabet + salt; ID
  Lens recognises the shape but cannot recover the underlying integers.
- **Snowflake disambiguation is best-effort.** A numeric string can
  plausibly decode under multiple vendor epochs; ID Lens shows all of
  them ranked by recency-of-past-date.

## Contributing

Issues and PRs welcome. Run `npm test && npm run lint && npm run build`
before opening a PR.

## License

[MIT](./LICENSE) © 2026 Skytuhua
