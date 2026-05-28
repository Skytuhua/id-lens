# Architecture

## Overall shape

Static single-page app. Everything runs in the browser. There is no server,
no API, no telemetry. Build output is plain HTML + JS + CSS suitable for any
static host (and for opening a file:// URL directly).

```
Browser
  └── ID Lens SPA (Preact + TypeScript, bundled with Vite)
        ├── Decoders (pure functions)
        ├── Detector (priority-ranked format probing)
        ├── UI (Inspector, Examples, Batch, Generators, About)
        └── Tokens / styles (CSS custom properties)
```

## Folder layout

```
id-lens/
├── public/                  # static assets copied verbatim
├── src/
│   ├── decoders/            # one file per format
│   │   ├── uuid.ts
│   │   ├── ulid.ts
│   │   ├── ksuid.ts
│   │   ├── snowflake.ts
│   │   ├── objectid.ts
│   │   ├── nanoid.ts
│   │   ├── tsid.ts
│   │   ├── xid.ts
│   │   ├── cuid.ts
│   │   ├── stripe.ts
│   │   ├── firebase.ts
│   │   ├── sqids.ts
│   │   ├── unixtime.ts
│   │   └── index.ts         # registry + types
│   ├── detect.ts            # auto-detection logic
│   ├── generators/          # small generators for v4/v7/ULID/NanoID/KSUID/ObjectId
│   ├── components/          # Preact components
│   │   ├── App.tsx
│   │   ├── Inspector.tsx
│   │   ├── Examples.tsx
│   │   ├── Batch.tsx
│   │   ├── Generators.tsx
│   │   ├── About.tsx
│   │   ├── FieldRow.tsx
│   │   ├── ByteLayout.tsx
│   │   ├── CopyButton.tsx
│   │   └── ThemeToggle.tsx
│   ├── lib/
│   │   ├── base32.ts        # Crockford base32 (ULID)
│   │   ├── base62.ts        # KSUID
│   │   ├── bytes.ts         # hex / byte helpers
│   │   └── time.ts          # epoch + ISO helpers
│   ├── examples.ts          # curated example IDs per format
│   ├── tokens.css           # design tokens
│   ├── styles.css           # component styles
│   ├── main.tsx             # mount point
│   └── types.ts             # DecodeResult, Field, Confidence, …
├── tests/                   # vitest specs, mirroring src/decoders
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .eslintrc.cjs
├── .prettierrc
├── README.md
├── SPEC.md
├── ARCHITECTURE.md
├── RESEARCH.md
├── DESIGN.md
├── CHANGELOG.md
├── BUILD_LOG.md
├── REVIEW.md
└── LICENSE
```

## Core types

```ts
type Confidence = 'high' | 'medium' | 'low';

interface DecodedField {
  label: string;
  value: string;            // canonical string representation
  hint?: string;            // tooltip / one-line explanation
  mono?: boolean;           // render in monospace
  copyable?: boolean;
}

interface ByteLayout {
  bytes: number[];                       // raw bytes, length matches format
  segments: { label: string; start: number; end: number; color: string }[];
}

interface DecodeResult {
  format: string;            // e.g. "UUID v7"
  confidence: Confidence;
  summary: string;           // one-line plain-English summary
  fields: DecodedField[];
  layout?: ByteLayout;       // when the format has a meaningful byte layout
  warnings?: string[];
  reference?: string;        // canonical spec link, opens in new tab
}

interface Decoder {
  id: string;                // stable key, e.g. "uuid", "ulid"
  name: string;              // display label
  matches(input: string): Confidence | null;
  decode(input: string): DecodeResult;
}
```

## Detection algorithm

1. Trim the input.
2. Strip wrapping quotes, URL-decode if it looks URL-encoded, accept a leading
   `urn:uuid:` prefix.
3. Run every registered decoder's `matches(input)` in priority order. Each
   returns `'high' | 'medium' | 'low' | null`.
4. Collect all non-null results.
5. Sort by confidence: `high > medium > low`. Ties broken by registration
   order (more specific formats registered first).
6. For each non-null match, run `decode(input)` to produce a `DecodeResult`.
7. UI shows the top candidate expanded, with alternatives collapsed below.

Heuristics include:

- Length first: a 32-char hex with hyphens is a UUID; a 26-char Crockford
  base32 is a ULID; a 27-char base62 is a KSUID; a 24-char hex is an ObjectId.
- Alphabet check: ULID uses Crockford (no `I`, `L`, `O`, `U`); KSUID uses
  base62; UUID is hex+hyphens.
- Prefix table: Stripe IDs decode from their prefix (`cus_`, `pi_`, `sub_`,
  `sk_test_`, …).
- Numeric Snowflakes: pure-digit strings of certain lengths get probed
  against each vendor's epoch; only "plausible date" results (between
  vendor launch and now + 1 year) qualify as `medium`.
- Nano IDs and Sqids are inherently ambiguous; they only match as `low`
  confidence when nothing else fits.

## State management

Single Preact `useReducer` at the top-level `App` holds:

```ts
{
  tab: 'inspector' | 'examples' | 'batch' | 'generators' | 'about',
  input: string,
  results: DecodeResult[],   // sorted by confidence
  theme: 'dark' | 'light',
}
```

Tab and theme persist in localStorage. Input is not persisted (privacy).

## Build & dev loop

| Command       | Purpose                                                 |
|---------------|---------------------------------------------------------|
| `npm run dev` | Vite dev server with HMR on port 5173                   |
| `npm run build` | Type-check + production build into `dist/`            |
| `npm run preview` | Serve `dist/` on port 4173 for verification         |
| `npm test`    | Vitest in run mode                                      |
| `npm run test:watch` | Vitest in watch mode                             |
| `npm run lint` | ESLint over `src/` and `tests/`                        |
| `npm run format` | Prettier write                                       |

## Dependencies

Runtime: `preact` only.
Dev: `vite`, `typescript`, `@preact/preset-vite`, `vitest`,
`@testing-library/preact` (only if needed; we may not need it), `eslint`,
`@typescript-eslint/*`, `prettier`. Versions pinned in `package.json`.

No runtime polyfills or fonts that block first paint. System font stack only.

## Threat model & privacy

- All processing is in the browser. The page makes no network requests after
  initial asset load.
- The input field never sends pasted data anywhere. We do not even log to
  `console.log` in production builds.
- No third-party analytics, no third-party fonts, no third-party iframes.
- A `Content-Security-Policy` meta tag in `index.html` restricts to `self`.
