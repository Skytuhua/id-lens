import { uuidDecoder } from './uuid';
import { ulidDecoder } from './ulid';
import { ksuidDecoder } from './ksuid';
import { objectIdDecoder } from './objectid';
import { snowflakeDecoder, decodeAllSnowflakeVariants } from './snowflake';
import { nanoIdDecoder } from './nanoid';
import { tsidDecoder } from './tsid';
import { xidDecoder } from './xid';
import { cuidDecoder } from './cuid';
import { stripeDecoder } from './stripe';
import { firebaseDecoder } from './firebase';
import { sqidsDecoder } from './sqids';
import { unixTimeDecoder } from './unixtime';
import { stripWrap } from '../lib/bytes';
import type { Decoder, DecodeResult } from '../types';

export { snowflakeDecoder, decodeAllSnowflakeVariants };

// Order matters for tie-breaking. More specific formats should be listed first
// so that ties on confidence prefer the more distinctive format.
export const DECODERS: Decoder[] = [
  uuidDecoder,
  ulidDecoder,
  ksuidDecoder,
  objectIdDecoder,
  xidDecoder,
  cuidDecoder,
  stripeDecoder,
  firebaseDecoder,
  tsidDecoder,
  snowflakeDecoder,
  unixTimeDecoder,
  nanoIdDecoder,
  sqidsDecoder,
];

const CONFIDENCE_RANK: Record<DecodeResult['confidence'], number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export interface DetectionRunOptions {
  /** When true, expand Snowflake into all matching epoch variants in the result list. */
  expandSnowflakeVariants?: boolean;
}

export function detectAll(rawInput: string, opts: DetectionRunOptions = {}): DecodeResult[] {
  const input = stripWrap(rawInput);
  if (!input) return [];

  const results: DecodeResult[] = [];
  for (const d of DECODERS) {
    if (d.id === 'snowflake') continue;
    const c = d.matches(input);
    if (c === null) continue;
    try {
      const r = d.decode(input);
      results.push(r);
    } catch {
      // Skip decoders that match-but-fail (defensive).
    }
  }

  const snowflakeVariants = decodeAllSnowflakeVariants(input);
  if (opts.expandSnowflakeVariants === false && snowflakeVariants.length > 0) {
    results.push(snowflakeDecoder.decode(input));
  } else {
    for (const v of snowflakeVariants) results.push(v);
  }

  const sorted = sortResults(results);
  // Suppress low-confidence candidates when at least one high-confidence match exists.
  // Genuinely ambiguous (medium) candidates are always kept.
  const hasHigh = sorted.some((r) => r.confidence === 'high');
  return hasHigh ? sorted.filter((r) => r.confidence !== 'low') : sorted;
}

function sortResults(rs: DecodeResult[]): DecodeResult[] {
  return [...rs].sort((a, b) => CONFIDENCE_RANK[b.confidence] - CONFIDENCE_RANK[a.confidence]);
}
