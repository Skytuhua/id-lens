/**
 * Map the decoder's numeric segment ids (used by `DecodedField.segment` and
 * `ByteLayout.segments[i].color`) to the named segments the TUI renders.
 *
 * The mapping is the historical convention:
 *   1 → time   (timestamps)
 *   2 → mach   (machine / MAC / process / shard / worker)
 *   3 → seq    (clock_seq / counter / sequence / increment)
 *   4 → rand   (randomness / payload)
 *   5 → ver    (version / variant / mode)
 *   0 → meta   (neutral / prefix / opaque)
 */
export type SegName = 'time' | 'mach' | 'seq' | 'rand' | 'ver' | 'meta';

export function segName(color: number | undefined): SegName | undefined {
  switch (color) {
    case 1: return 'time';
    case 2: return 'mach';
    case 3: return 'seq';
    case 4: return 'rand';
    case 5: return 'ver';
    case 0: return 'meta';
    default: return undefined;
  }
}

/**
 * Map categorical confidence to a 0-1 scalar for the 5-cell confidence bar.
 * High = full, medium = three of five, low = one of five.
 */
export function confidenceToFraction(c: 'high' | 'medium' | 'low'): number {
  if (c === 'high') return 1;
  if (c === 'medium') return 0.6;
  return 0.2;
}
