import type { Decoder, DecodeResult, Confidence } from '../types';
import { unixMsToIso, ago } from '../lib/time';

// Firebase push ID: 20 characters from the alphabet
// "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz" (custom)
// First 8 chars encode the timestamp; last 12 chars are random.
const FIREBASE_ALPHABET = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
const FIREBASE_RE = /^[-_0-9A-Za-z]{20}$/;

const DECODE_TABLE: Record<string, number> = (() => {
  const t: Record<string, number> = {};
  for (let i = 0; i < FIREBASE_ALPHABET.length; i++) t[FIREBASE_ALPHABET[i]] = i;
  return t;
})();

function decodeTimestamp(prefix: string): number | null {
  let n = 0;
  for (const ch of prefix) {
    const v = DECODE_TABLE[ch];
    if (v === undefined) return null;
    n = n * 64 + v;
  }
  return n;
}

export const firebaseDecoder: Decoder = {
  id: 'firebase',
  name: 'Firebase push ID',

  matches(input: string): Confidence | null {
    const s = input.trim();
    if (!FIREBASE_RE.test(s)) return null;
    const ts = decodeTimestamp(s.slice(0, 8));
    if (ts === null) return null;
    const now = Date.now();
    // Firebase push IDs were introduced in 2015; reject implausible timestamps
    if (ts < 1420070400000) return 'low';
    if (ts > now + 365 * 86400 * 1000) return 'low';
    // Push IDs do contain `-` or `_` typically; if the first char is a-zA-Z0-9
    // we still have a real match, but lower confidence
    return 'high';
  },

  decode(input: string): DecodeResult {
    const s = input.trim();
    const ts = decodeTimestamp(s.slice(0, 8)) ?? 0;
    const random = s.slice(8);
    return {
      format: 'Firebase push ID',
      formatId: 'firebase',
      confidence: 'high',
      summary: `Firebase push ID generated ${ago(ts)}. 8 chars timestamp (custom base64) + 12 chars random.`,
      fields: [
        { label: 'Canonical', value: s, mono: true, copyable: true },
        { label: 'Timestamp', value: unixMsToIso(ts), hint: ago(ts), mono: true, segment: 1 },
        { label: 'Unix ms', value: String(ts), mono: true, segment: 1 },
        { label: 'Random', value: random, mono: true, segment: 4 },
      ],
      reference: { label: 'The 2^120 Ways to Ensure Unique Identifiers', url: 'https://firebase.blog/posts/2015/02/the-2120-ways-to-ensure-unique-identifiers/' },
    };
  },
};
