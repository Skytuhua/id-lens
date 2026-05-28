# ID Lens — Design System (v2)

Single source of truth for visual decisions. Every screen renders against
these tokens; deviations are bugs.

## Aesthetic intent

A terminal-native instrument. Fixed-grid, monospace everywhere, dark only.
The visual language is closer to `htop`, `lazygit`, `tmux`, `xxd` than to a
marketing page. Sharp rectangles, hairline borders, box-drawing characters,
a faint scanline overlay. One chromatic accent (amber) reserved for the
active state, focus, copy-flash, and the mode pill — everything else uses
either the warm CRT-cream ink or the segment palette (which is taxonomy,
never decoration).

The previous (v1) cool-blue debugger aesthetic is gone. So is light mode.

## Color tokens

```
/* Surfaces — slightly cool, never pure black */
--canvas:        #0a0c10
--surface:       #11141b
--surface-alt:   #161a22
--surface-hi:    #1c2230
--inset:         #07090d

/* Hairlines — also the box-draw character color */
--rule:          #2a313d
--rule-strong:   #3d4757
--rule-dim:      #1a1f29

/* Ink — warm off-white, CRT-phosphor cream */
--ink:           #d8d2c4
--ink-bright:    #ece6d6
--ink-muted:     #8a9099
--ink-dim:       #545b66
--ink-faint:     #363c46

/* Single accent: amber */
--amber:         #e8a04a
--amber-bright:  #f3b365
--amber-dim:     #7a5527
--amber-wash:    rgba(232, 160, 74, 0.10)

/* Segment palette — taxonomy only, never decoration */
--seg-time:      #6ba8d4  /* timestamps */
--seg-mach:      #c78ad6  /* machine / shard / worker */
--seg-seq:       #e8a04a  /* counter / sequence */
--seg-rand:      #9ec182  /* randomness / payload */
--seg-ver:       #e6c073  /* version / variant */
--seg-meta:      #7a8294  /* prefix, env, opaque */

/* State */
--ok:            #9ec182
--warn:          #e6c073
--err:           #d97a7a
```

Rules of use:

- `--amber` is reserved for: the active tab indicator, the `prompt` glyph,
  the format-name pill on the primary result, the mode pill in the status
  bar, focus rings, copy-flash, and links. It never fills large surfaces.
- `--seg-*` colors appear only on byte cells (hex dump) and the matching
  field-label markers. They are taxonomy, not decoration.
- `--ok` / `--warn` / `--err` only for explicit state semantics
  (confidence bar segments, parse-error rail, copy-flash success).

## Typography

System mono, with `JetBrains Mono` as a soft preference. No `@import`,
no web fonts downloaded — the system fallback is the actual ship target.
This keeps the strict `connect-src 'self'` CSP intact.

```
--mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas,
        'Cascadia Code', monospace;
```

Type scale (every size is also a custom property `--t-*`):

| Token     | Size  | Use                                                  |
|-----------|-------|------------------------------------------------------|
| `--t-xs`  | 11px  | Status bar labels, eyebrows, kbd, segment legend     |
| `--t-sm`  | 12px  | Tab labels, candidate rows, batch table, hints       |
| `--t-md`  | 13px  | Default body, hex dump cells, field values, prose    |
| `--t-lg`  | 15px  | Inspector input value, prompt glyph                  |
| `--t-xl`  | 20px  | (reserved)                                           |
| `--t-2xl` | 28px  | (reserved)                                           |

Line height: `--lh: 1.5` everywhere except the hex dump (`1.4`).

`font-variant-numeric: tabular-nums` everywhere. Ligatures explicitly
disabled (`font-variant-ligatures: none`).

Field labels and eyebrows are UPPERCASE with positive tracking (0.12 –
0.14 em). The rest is mixed case.

## Spacing

The TUI doesn't have a named spacing scale — it uses the implicit 4 / 8 /
12 / 16 / 24 / 32 grid in inline values. Two consistent values are:

- Panel interior padding: `16px` (`tight` panels: `0` and rely on row
  padding).
- Decode card body padding: `18px`.

## Radius

```
border-radius: 0
```

Zero radius everywhere by intent. The TUI doesn't round corners. No pills.

## Elevation

Depth is carried by the surface ladder + hairline borders. No drop shadows
anywhere, except a single soft `--amber-wash` glow under the focused
input. The faint scanline overlay (1.2 % alpha, `overlay` blend-mode) is
non-interactive and pure texture.

## Components

### Titlebar
- 56 px tall. Bracketed wordmark `[ ID · LENS ]` left (amber brackets,
  ink-bright lettering), `UNIVERSAL IDENTIFIER INSPECTOR` eyebrow center,
  live UTC clock with an `--ok` indicator right.
- Bottom hairline. No padding-top, sits at the top of `.shell`.

### Tabs (tmux idiom)
- Numbered (`1 inspector  2 examples  3 batch  4 generators  5 about`).
- Hairline column separators between tabs.
- Selected tab: 2-px `--amber` underline + amber text + amber number.
- Right-aligned keybinding hint with `kbd` glyphs.
- `1`–`5` switch; `/` focuses input; `?` toggles help; `Esc` closes.

### Inspector input
- Shell prompt `>` glyph in `--amber`, weight 600, hairline-divided from
  the input.
- No outer rounding, no inner shadow — just inset background
  `--inset`, hairline border, `--amber` border + soft amber wash on
  focus.
- Inline `PASTE` and `CLEAR` actions in the right gutter (uppercase,
  hairline-divided, amber on hover).

### Decode (result) card
- Top strip: format name (amber), summary, **5-cell confidence bar**
  (`--ok` / `--warn` / `--err`) + categorical label.
- Body: hex-dump cross-section + legend + field grid + spec link.

### Hex-dump cross-section
- Each byte cell is `min-width: 2.4ch`, color-coded to its segment.
- A second row of unicode box-drawing characters (`╰─`, `──`, `─╯`,
  `┃`) draws **leader brackets** under each contiguous segment.
- A legend underneath names each segment + width in bits.
- Segment color = taxonomy (never decoration). Snowflakes intentionally
  render *without* a hex-dump — their bit-packed structure isn't
  byte-aligned, so coloring each byte by one segment would mislead.

### Field grid
- 3-column `label · value · copy` grid.
- Each label has a square segment-color **marker** that matches the
  byte-dump taxonomy.
- Copy buttons are uppercase `COPY`, flash to `--ok` background with
  `✓ COPIED` on success.

### Confidence bar
- 5 cells. High = 5 on, medium = 3 on, low = 1 on.
- `--ok` for high, `--warn` for medium, `--err` for low.

### Candidates list
- Collapsed under the primary result when there are alternates.
- Click any row to expand its full hex-dump + field grid inline.

### Status bar
- 24-px tall, pinned `position: fixed; bottom: 0`.
- Segments separated by hairlines.
- Mode segment is amber-on-canvas, bold.
- Permanent privacy claim on the right:
  `100% client-side · 0 network`.

### Empty / error states
- Empty: `Awaiting input.` + hint + chip row of try-me examples.
- Parse error: `--err` left rail (4 px) + `UNRECOGNISED` title +
  helpful sentence.

### Help overlay
- Triggered by `?`. Modal-ish (dim scrim, click-outside closes).
- Lists every key binding with `kbd` glyphs.

## Motion

- Transitions: 120 ms color/background/border only.
- No layout animation.
- `@media (prefers-reduced-motion: reduce)` zeros all transitions.

## Accessibility

- All interactive elements reachable via Tab.
- `aria-selected` on tabs; `role='tablist'` on the tab bar.
- `aria-live='polite'` on results and copy buttons.
- Focus rings always visible (`outline: 1px solid var(--amber)`).
- Color contrast: `--ink` on `--canvas` clears WCAG AA at body sizes.

## Don't

- Don't add a second chromatic accent.
- Don't pill-round anything.
- Don't introduce drop shadows.
- Don't use `#000000` true black for the canvas.
- Don't animate layout on tab change.
- Don't put segment colors on UI chrome — they are taxonomy only.
- Don't load web fonts. System mono is the ship target.
- Don't reintroduce light mode without explicitly inverting the
  surface ladder *and* the ink-warmth — the warm-cream ink doesn't
  translate to a light canvas.

## Historical note

v1 used a cool-blue debugger aesthetic with rounded cards, system sans
labels, and a light/dark toggle. v2 fully replaces that — see
`CHANGELOG.md` and the v2 entry in `BUILD_LOG.md` for the full diff.
