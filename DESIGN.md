# ID Lens — Design System

Single source of truth for visual decisions. Every screen renders against
these tokens; deviations are bugs.

## Aesthetic intent

A precision instrument. Dark-first, monospace-confident, generous breathing
room. The visual language is closer to a debugger than a marketing page:
hairline borders, sharp corners, tabular numbers, byte-grid layouts. Color
is used sparingly — one cool accent for "this is the answer," three muted
hues for byte-group highlighting, semantic green/amber/red reserved for
states. Nothing decorative, nothing celebratory.

## Color tokens

```
--canvas:           #07090c    /* page background */
--surface-1:        #0d1117    /* primary card / panel */
--surface-2:        #141a23    /* inner card / hover state */
--surface-3:        #1b2330    /* elevated overlay, dropdowns */
--surface-input:    #0b1018    /* input fields */

--hairline:         #1f2a3a    /* default border */
--hairline-strong:  #2a3a52    /* focused / emphasised border */
--hairline-soft:    #131a26    /* nested separators */

--ink:              #e6edf6    /* primary text */
--ink-muted:        #aab6c8    /* secondary text */
--ink-subtle:       #6c7a90    /* tertiary text, labels */
--ink-faint:        #4a5468    /* placeholders, disabled */

--accent:           #7aa2ff    /* primary accent (cool blue) */
--accent-hover:     #97b7ff
--accent-press:     #5f8cf2
--accent-glow:      rgba(122, 162, 255, 0.18)

--seg-1:            #7aa2ff    /* timestamp group */
--seg-2:            #c792ea    /* machine / shard group */
--seg-3:            #f78c6c    /* counter / sequence group */
--seg-4:            #82d8a7    /* random / payload group */
--seg-5:            #ffcb6b    /* version / variant group */

--success:          #4ec9a4
--warning:          #e0c170
--danger:           #f47174
```

Rules of use:

- `--accent` is reserved for: the active tab indicator, focus rings, the
  detected-format pill on the top result, copy-confirm flashes, and links.
  It never fills large surfaces.
- `--seg-*` colors appear only in the byte-layout strip and on the
  corresponding field labels — they are taxonomy, not decoration.
- Use `--success` / `--warning` / `--danger` only for explicit state
  semantics (validation, parse error, confidence warnings).

## Typography

System fonts only. No web fonts; no blocking network requests.

```
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter",
             "Helvetica Neue", Arial, system-ui, sans-serif;
--font-mono: "SF Mono", "JetBrains Mono", "Fira Code", "Cascadia Code",
             ui-monospace, Menlo, Consolas, monospace;
```

Scale (every size is also a custom property `--type-*`):

| Token         | Size  | Weight | Line-height | Tracking | Use                                        |
|---------------|-------|--------|-------------|----------|--------------------------------------------|
| `display`     | 28px  | 600    | 1.20        | -0.4px   | Page-level headline ("ID Lens" wordmark, About hero) |
| `headline`    | 20px  | 600    | 1.30        | -0.2px   | Section headlines                          |
| `subhead`     | 16px  | 600    | 1.40        | -0.1px   | Card titles, result format name            |
| `body`        | 14px  | 400    | 1.55        | 0        | Paragraphs                                 |
| `body-sm`     | 13px  | 400    | 1.50        | 0        | Helper / hint text                         |
| `caption`     | 12px  | 500    | 1.40        | 0.4px    | UPPERCASE eyebrow, field labels            |
| `mono-lg`     | 16px  | 500    | 1.40        | 0        | Inspector input, headline IDs              |
| `mono`        | 13px  | 400    | 1.55        | 0        | Decoded field values, byte layout          |
| `mono-sm`     | 12px  | 400    | 1.50        | 0        | Compact tables, batch results              |
| `button`      | 13px  | 500    | 1.20        | 0.1px    | All buttons                                |

Tabular numerals (`font-variant-numeric: tabular-nums`) everywhere we show
numbers, timestamps, or byte grids.

Field labels (`caption`) are UPPERCASE with +0.4px tracking. The rest of
the UI is mixed case.

## Spacing

```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  24px
--space-6:  32px
--space-7:  48px
--space-8:  64px
```

- Card interior padding: `--space-5` (24px).
- Field-row vertical rhythm: `--space-3` (12px).
- Section gap (between cards): `--space-5` (24px).
- Page top breathing room: `--space-7` (48px).

## Radius

```
--radius-xs:  4px    /* chips, status pills */
--radius-sm:  6px    /* buttons, inputs */
--radius-md:  10px   /* cards */
--radius-lg:  14px   /* main inspector panel */
--radius-pill: 999px
```

Sharp by intent: no `radius-lg` on small elements. Buttons sit at
`--radius-sm`, never pill.

## Elevation

Depth is carried by surface ladder + hairlines. No drop shadows on the
dark surface, except a single soft glow under the focused input.

| Level | Treatment                                                          |
|-------|--------------------------------------------------------------------|
| 0     | `--canvas`, no border                                              |
| 1     | `--surface-1` + 1px `--hairline`                                   |
| 2     | `--surface-2` + 1px `--hairline-strong`                            |
| 3     | `--surface-3` + 1px `--hairline-strong` + `0 8px 24px rgba(0,0,0,.4)` (overlays only) |
| focus | 2px `--accent` outline at 50% opacity, offset 2px                  |

## Components

### Header bar
- Height 56px, background `--canvas`, bottom hairline.
- Left: lens-glyph wordmark (`display` weight, mono "ID" + sans "Lens").
- Right: theme toggle, GitHub link.

### Tabs
- Inline pill row; selected tab uses `--surface-2` background, `--accent`
  text. Padding `--space-2` `--space-4`. Radius `--radius-pill`.

### Inspector input
- Mono-lg, multi-line capable but starts at single-line height.
- Background `--surface-input`, border `--hairline`, radius `--radius-md`,
  padding `--space-4`.
- Focus: border `--accent` + soft glow `--accent-glow`.
- Placeholder: ink-faint, "Paste any identifier…".

### Result card
- Background `--surface-1`, border 1px `--hairline`, radius `--radius-lg`,
  padding `--space-5`.
- Header row: format pill (accent-tinted), confidence badge, summary line.
- Body: field grid (label / value / copy) with 12px vertical rhythm.
- Footer: byte-layout strip (when applicable), reference link.

### Field row
- Three columns: label (caption, ink-subtle, 100px fixed), value (mono,
  ink, flex), copy button (24×24, surface-2 background, hairline border).
- Hover: value background gains `--surface-2`.

### Byte layout strip
- Each byte is a 28×28 (mobile) / 32×32 (desktop) cell containing two hex
  digits in `mono-sm`. Background is the segment color at 18% alpha;
  border is the segment color at 60% alpha. Cells abut.
- A legend strip below names each segment in the matching color.

### Buttons
- Primary: `--accent` background, `--canvas` text, radius `--radius-sm`.
  Hover → `--accent-hover`. Press → `--accent-press`.
- Secondary: `--surface-2` background, `--ink` text, hairline border.
- Ghost: transparent, `--ink-muted` text, hover surface-2.
- Icon (copy): 24×24 square, hairline border, surface-2 hover, accent flash
  on success (200ms ease-out).

### Tabs / nav
- See "Tabs" above. Tab labels in `body` weight 500.

### Badges
- Confidence: pill, radius `--radius-pill`, padding 2px 8px, caption font.
  High → success tint. Medium → warning tint. Low → ink-subtle tint.

### Examples list
- 2-column grid at desktop, 1-column on mobile.
- Each card: format name (subhead), example ID (mono-sm, truncated),
  "Inspect" ghost button.

### Batch table
- Sticky-header table. Columns: Input (mono-sm, truncate 24ch), Format,
  Key field (timestamp / version / type), Confidence.

### Empty / error / success states
- Empty inspector: small explanatory text + a row of "Try one of these"
  example chips.
- Parse error: red-tinted card with `--danger` left rule and a helpful
  message ("Doesn't look like any format I recognise — supported formats
  listed in About.").

## Motion

- Transitions: 150ms `ease-out` for color/background/border. 200ms for
  copy-flash success. No spring physics. No layout animations.
- Avoid `prefers-reduced-motion`: respect it by zeroing all transitions.

## Accessibility

- Body contrast minimum: ink on canvas ≥ 11:1. Verified.
- Focus rings always visible (no `outline: none` without replacement).
- All buttons reachable via Tab. Order matches visual reading order.
- Tab role + `aria-selected` on the tab row.
- Copy buttons announce success via `aria-live="polite"`.
- All decorative icons set `aria-hidden="true"`.

## Light mode

Inverted surface ladder but the same hue families. Canvas `#f5f7fa`,
surface-1 `#ffffff`, ink `#0e1117`. Accent stays the same hue (`#3d6dd6`
on light, slightly darker to retain contrast). Tab selection state uses
ink rather than accent for the text. Persisted in localStorage.

## Don't

- Don't add a second chromatic accent.
- Don't pill-round CTAs.
- Don't introduce drop shadows on cards.
- Don't use `#000000` true black for the canvas.
- Don't animate layout on tab change.
- Don't decorate the byte-layout strip — segment colors are taxonomy.
- Don't load web fonts.
