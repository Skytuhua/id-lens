import type { Decoder, DecodeResult, Confidence } from '../types';
import { decodeCrockford } from '../lib/base32';
import { bigIntToBytes } from '../lib/bytes';
import { unixMsToIso, ago } from '../lib/time';

// TSID: 64-bit ID, 13-character Crockford base32. 42-bit ms timestamp + 22-bit random.
// Epoch: 2020-01-01T00:00:00Z = 1577836800000 ms
const TSID_EPOCH_MS = 1577836800000;
const TSID_RE = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{13}$/;

export const tsidDecoder: Decoder = {
  id: 'tsid',
  name: 'TSID',

  matches(input: string): Confidence | null {
    const s = input.trim();
    if (!TSID_RE.test(s)) return null;
    // Plausibility: leading char is at most '7' (since 64-bit fits in 13 base32 chars)
    if (s[0] > '7') return null;
    try {
      const n = decodeCrockford(s);
      if (n >> 64n !== 0n) return null;
      const ms = Number(n >> 22n) + TSID_EPOCH_MS;
      const now = Date.now();
      if (ms < TSID_EPOCH_MS || ms > now + 5 * 365 * 86400 * 1000) return 'low';
      return 'medium';
    } catch {
      return null;
    }
  },

  decode(input: string): DecodeResult {
    const s = input.trim().toUpperCase();
    const n = decodeCrockford(s);
    const ms = Number(n >> 22n) + TSID_EPOCH_MS;
    const random = Number(n & 0x3fffffn);
    const bytes = bigIntToBytes(n, 8);

    return {
      format: 'TSID',
      formatId: 'tsid',
      confidence: 'medium',
      summary: `Time-Sortable ID generated ${ago(ms)}. 42-bit ms timestamp (epoch 2020-01-01) + 22-bit random.`,
      fields: [
        { label: 'Canonical', value: s, mono: true, copyable: true },
        { label: 'Timestamp', value: unixMsToIso(ms), hint: ago(ms), mono: true, segment: 1 },
        { label: 'Unix ms', value: String(ms), mono: true, segment: 1 },
        { label: 'Random', value: String(random), mono: true, segment: 4 },
        { label: 'Integer', value: n.toString(), mono: true },
      ],
      layout: {
        bytes,
        segments: [
          { label: '42-bit timestamp', start: 0, end: 6, color: 1 },
          { label: '22-bit random', start: 5, end: 8, color: 4 },
        ],
      },
      reference: { label: 'TSID-creator (Java)', url: 'https://github.com/f4b6a3/tsid-creator' },
    };
  },
};
