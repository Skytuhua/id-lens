# Research & Idea Selection

## Goal
Pick one niche software product that has clear, observable demand, is doable to
a polished v1 with the available toolchain (Node, Vite, headless browser for
screenshots, GitHub for shipping), and is unambiguously lawful.

## Candidate shortlist

Each idea was scored 1–5 on the rubric in the master prompt. Legal/ethical
is a pass/fail gate, not a numeric score.

| # | Idea | Niche | Demand | Doable | Demo | Scope | Legal | Total |
|---|------|------:|-------:|-------:|-----:|------:|------:|------:|
| 1 | **ID Lens — universal identifier inspector** (UUID v1–v8, ULID, KSUID, Snowflake, ObjectId, Stripe, NanoID, Xid, TSID, CUID/CUID2, Sqids, Unix timestamps) | 5 | 4 | 5 | 5 | 5 | pass | **24** |
| 2 | Cron Expression Studio (multi-dialect, calendar view, timezone-aware) | 3 | 4 | 5 | 5 | 4 | pass | 21 |
| 3 | CSV → SQL DDL generator with smart type inference | 4 | 3 | 5 | 4 | 4 | pass | 20 |
| 4 | OG-card previewer for X/LinkedIn/Discord/Slack | 4 | 3 | 3 (CORS) | 4 | 3 | pass | 17 |
| 5 | Color-token / WCAG contrast matrix for design systems | 3 | 3 | 4 | 4 | 3 | pass | 17 |

## Why ID Lens wins

**Evidence of demand**

- CLI tools (`Racum/uuinfo`, `zcyc/idinfo`) exist and have meaningful adoption,
  proving the "I have a string, what kind of ID is it?" problem is real for
  backend devs, support engineers, and analysts.
- Browser tools are fragmented and shallow: `uuidtools.com` is UUID-only,
  `ksuid.net` is generator-first, ULID-only tools are scattered. None of the
  popular browser tools auto-detect across formats.
- Recurring confusion in dev communities: "Is this a Snowflake or a UUID?",
  "How do I read a Discord ID?", "What's inside a Stripe `cus_…` ID?".
- IDs show up in support tickets, logs, audit trails, and analytics
  exports — a wide and durable audience.

**The underserved gap**

A single browser page where you paste *anything* and immediately see:

1. What kind of ID it is (auto-detected).
2. Decoded fields (timestamp, machine, sequence, randomness, environment, …).
3. A clear visual byte / bit layout.
4. A copy button on every field.
5. Zero telemetry, fully client-side.

No existing tool combines breadth, polish, and privacy.

**Doable**

- Pure client-side TypeScript app — no backend, no API keys, no CORS issues.
- All decoders are deterministic byte/string operations. No ML, no fancy infra.
- Headless browser available locally for screenshot-based QA.
- Static-site output ships easily as a GitHub Pages deployment + zipped
  artifact attached to a release.

**Defensible scope**

The v1 feature set fits in one paragraph (see `SPEC.md`). The product has a
sharp core (inspect IDs) and a clear set of supported formats. Anything beyond
that is explicitly a non-goal in the spec.

**Legal / ethical**

- Operates on text the user pastes in. No data collection.
- Does not decode anything that requires private keys, credentials, or
  bypassing access controls. JWT-signature verification, encrypted tokens,
  and hash inversion are explicit non-goals.
- All decoded formats are public specifications.

## Target user

Backend engineers, SREs, support engineers, data analysts, and indie devs who
encounter unfamiliar identifier strings in logs, databases, support tickets,
or API payloads and want a fast, trustworthy way to understand what they are
and what's inside them.

## One-paragraph pitch

> **ID Lens** is a privacy-respecting browser tool that auto-detects and
> decodes any identifier you paste — UUIDs (v1 through v8), ULIDs, KSUIDs,
> NanoIDs, Snowflake IDs from Twitter / Discord / Instagram, MongoDB
> ObjectIds, Stripe IDs, Firebase push IDs, TSIDs, Xids, CUIDs, Sqids, and
> Unix timestamps. It explains what each field means, shows the byte layout,
> and runs entirely in your browser with no telemetry. The CLI tools that
> already do this well (uuinfo, idinfo) prove the problem is real; ID Lens
> brings the same comprehensiveness to a polished web UI that anyone can
> open instantly.

## Out-of-scope (non-goals for v1)

- JWT decoding / signature verification (separate concern).
- Hash decoding / cracking (impossible by design).
- Server-side or "look up" features that hit external services.
- Encrypted token decryption.
- Auto-generation as the primary surface — generators are a secondary feature.
- Mobile-native apps — responsive web is enough.

## Tech stack decision

- **Build tool:** Vite 5 (fast dev server, easy static output)
- **Language:** TypeScript (decoders benefit from strong types)
- **UI:** Preact 10 (~3 KB, JSX productivity without React overhead)
- **Styling:** Hand-rolled CSS with custom-property tokens. Aesthetic
  inspired by Linear / Vercel — dark-first, monospace-heavy, sharp.
- **Testing:** Vitest (unit tests on every decoder)
- **Lint / format:** ESLint + Prettier
- **Hosting:** GitHub Pages
- **Distribution:** Static-site zip attached to a GitHub release

## Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| Ambiguous IDs match multiple formats | Show ranked candidates with confidence reasoning, not a single guess |
| Hex-only IDs (MongoDB vs UUID-no-dashes) collide | Use length and structural tests; surface both interpretations when ambiguous |
| Unfamiliar IDs (Stripe `pi_…`) might be too long to enumerate | Maintain a curated prefix table; allow generic prefix decoding when unknown |
| Bundle size creeps as decoders grow | Decoder modules are tree-shakeable; keep `bigint` math hand-rolled, no heavy deps |
| Timestamp display confusion across epochs (Snowflake offsets) | Each decoder declares its epoch; UI shows both raw and UTC ISO date |
