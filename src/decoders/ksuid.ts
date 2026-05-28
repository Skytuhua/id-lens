import type { Decoder, DecodeResult, Confidence } from '../types';
import { decodeBase62 } from '../lib/base62';
import { bigIntToBytes, bytesToHex } from '../lib/bytes';
import { unixSecToIso, ago } from '../lib/time';

const KSUID_EPOCH_SEC = 1400000000; // 2014-05-13 16:53:20 UTC
const KSUID_RE = /^[0-9A-Za-z]{27}$/;

export const ksuidDecoder: Decoder = {
  id: 'ksuid',
  name: 'KSUID',

  matches(input: string): Confidence | null {
    const s = input.trim();
    if (s.length !== 27) return null;
    if (!KSUID_RE.test(s)) return null;
    // Light plausibility check: decoded value must fit in 160 bits
    try {
      const n = decodeBase62(s);
      if (n >> 160n !== 0n) return null;
      return 'high';
    } catch {
      return null;
    }
  },

  decode(input: string): DecodeResult {
    const s = input.trim();
    const n = decodeBase62(s);
    const bytes = bigIntToBytes(n, 20);
    const ts32 = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
    const unixSec = ts32 + KSUID_EPOCH_SEC;
    const iso = unixSecToIso(unixSec);
    const payload = bytes.slice(4, 20);

    return {
      format: 'KSUID',
      formatId: 'ksuid',
      confidence: 'high',
      summary: `Segment KSUID generated ${ago(unixSec * 1000)}. 32-bit timestamp (epoch 2014-05-13) + 128-bit random payload.`,
      fields: [
        { label: 'Canonical', value: s, mono: true, copyable: true },
        { label: 'Timestamp', value: iso, hint: ago(unixSec * 1000), mono: true, segment: 1 },
        { label: 'Unix seconds', value: String(unixSec), mono: true, segment: 1 },
        { label: 'Payload', value: bytesToHex(payload), mono: true, segment: 4 },
        { label: 'Hex (full)', value: bytesToHex(bytes), mono: true },
      ],
      layout: {
        bytes,
        segments: [
          { label: '32-bit timestamp', start: 0, end: 4, color: 1 },
          { label: '128-bit payload', start: 4, end: 20, color: 4 },
        ],
      },
      reference: { label: 'KSUID spec (Segment)', url: 'https://github.com/segmentio/ksuid' },
    };
  },
};
