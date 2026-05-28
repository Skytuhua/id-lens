import type { Decoder, DecodeResult, Confidence } from '../types';
import { unixMsToIso, ago } from '../lib/time';

// CUID v1: 25 chars, starts with 'c', then 8 hex-ish timestamp chars,
// 4-char counter, 4-char fingerprint, 8-char random.
const CUID1_RE = /^c[a-z0-9]{24}$/;
// CUID v2: 24-32 chars lowercase, intentionally opaque
const CUID2_RE = /^[a-z][a-z0-9]{23,31}$/;

export const cuidDecoder: Decoder = {
  id: 'cuid',
  name: 'CUID',

  matches(input: string): Confidence | null {
    const s = input.trim();
    if (CUID1_RE.test(s)) return 'high';
    if (CUID2_RE.test(s)) return 'low';
    return null;
  },

  decode(input: string): DecodeResult {
    const s = input.trim();
    if (CUID1_RE.test(s)) {
      // c | timestamp(8 base36) | counter(4 base36) | fingerprint(4) | random(8)
      const timestampPart = s.slice(1, 9);
      const counterPart = s.slice(9, 13);
      const fingerprint = s.slice(13, 17);
      const randomPart = s.slice(17, 25);
      const ms = parseInt(timestampPart, 36);
      return {
        format: 'CUID v1',
        formatId: 'cuid',
        confidence: 'high',
        summary: `CUID v1 generated ${ago(ms)}. Timestamp + counter + host fingerprint + random.`,
        fields: [
          { label: 'Canonical', value: s, mono: true, copyable: true },
          { label: 'Timestamp', value: unixMsToIso(ms), hint: ago(ms), mono: true, segment: 1 },
          { label: 'Unix ms', value: String(ms), mono: true, segment: 1 },
          { label: 'Counter', value: String(parseInt(counterPart, 36)), mono: true, segment: 3 },
          { label: 'Fingerprint', value: fingerprint, mono: true, segment: 2 },
          { label: 'Random', value: randomPart, mono: true, segment: 4 },
        ],
        reference: { label: 'paralleldrive/cuid', url: 'https://github.com/paralleldrive/cuid' },
      };
    }
    // CUID v2 — opaque
    return {
      format: 'CUID v2',
      formatId: 'cuid',
      confidence: 'low',
      summary: 'Likely a CUID v2. v2 is intentionally opaque — no fields can be decoded.',
      fields: [
        { label: 'Canonical', value: s, mono: true, copyable: true },
        { label: 'Length', value: String(s.length) },
        { label: 'Charset', value: 'a-z 0-9 (lowercase)', mono: true },
      ],
      warnings: ['CUID v2 deliberately encodes no recoverable structure for security reasons.'],
      reference: { label: 'paralleldrive/cuid2', url: 'https://github.com/paralleldrive/cuid2' },
    };
  },
};
