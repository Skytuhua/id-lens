import type { Decoder, DecodeResult, Confidence } from '../types';
import { decodeCrockford } from '../lib/base32';
import { bigIntToBytes } from '../lib/bytes';
import { unixMsToIso, ago } from '../lib/time';

const ULID_RE = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/;

export const ulidDecoder: Decoder = {
  id: 'ulid',
  name: 'ULID',

  matches(input: string): Confidence | null {
    const s = input.trim();
    if (s.length !== 26) return null;
    if (!ULID_RE.test(s)) return null;
    return 'high';
  },

  decode(input: string): DecodeResult {
    const s = input.trim().toUpperCase();
    const n = decodeCrockford(s);
    const bytes = bigIntToBytes(n, 16);
    const tsMs = Number(n >> 80n);
    const iso = unixMsToIso(tsMs);
    const randomBytes = bytes.slice(6, 16);
    const randomHex = randomBytes.map((b) => b.toString(16).padStart(2, '0')).join('');

    return {
      format: 'ULID',
      formatId: 'ulid',
      confidence: 'high',
      summary: `Sortable 128-bit ID generated ${ago(tsMs)}. First 48 bits encode the millisecond timestamp; the rest is random.`,
      fields: [
        { label: 'Canonical', value: s, mono: true, copyable: true },
        { label: 'Timestamp', value: iso, hint: ago(tsMs), mono: true, segment: 1 },
        { label: 'Timestamp (ms)', value: String(tsMs), mono: true, segment: 1 },
        { label: 'Randomness', value: randomHex, mono: true, segment: 4 },
        { label: 'Integer', value: n.toString(), mono: true },
      ],
      layout: {
        bytes,
        segments: [
          { label: '48-bit Unix ms', start: 0, end: 6, color: 1 },
          { label: '80-bit randomness', start: 6, end: 16, color: 4 },
        ],
      },
      reference: { label: 'ULID spec (Stripe / oklog)', url: 'https://github.com/ulid/spec' },
    };
  },
};
