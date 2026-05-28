import type { Decoder, DecodeResult, Confidence } from '../types';
import { hexToBytes, HEX_RE } from '../lib/bytes';
import { unixSecToIso, ago } from '../lib/time';

export const objectIdDecoder: Decoder = {
  id: 'objectid',
  name: 'MongoDB ObjectId',

  matches(input: string): Confidence | null {
    const s = input.trim();
    if (s.length !== 24) return null;
    if (!HEX_RE.test(s)) return null;
    // Plausibility: timestamp must land between MongoDB's first release (2009) and 50y from now
    const bytes = hexToBytes(s);
    const ts = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
    const minTs = 1230768000; // 2009-01-01
    const maxTs = Math.floor(Date.now() / 1000) + 50 * 365 * 86400;
    if (ts < minTs || ts > maxTs) return 'low';
    return 'high';
  },

  decode(input: string): DecodeResult {
    const s = input.trim().toLowerCase();
    const bytes = hexToBytes(s);
    const ts = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
    const iso = unixSecToIso(ts);
    const machine = bytes.slice(4, 9).map((b) => b.toString(16).padStart(2, '0')).join('');
    const counter = (bytes[9] << 16) | (bytes[10] << 8) | bytes[11];

    return {
      format: 'MongoDB ObjectId',
      formatId: 'objectid',
      confidence: 'high',
      summary: `12-byte MongoDB ObjectId generated ${ago(ts * 1000)}. 4-byte timestamp + 5-byte random (process) + 3-byte counter.`,
      fields: [
        { label: 'Canonical', value: s, mono: true, copyable: true },
        { label: 'Timestamp', value: iso, hint: ago(ts * 1000), mono: true, segment: 1 },
        { label: 'Unix seconds', value: String(ts), mono: true, segment: 1 },
        { label: 'Process ID', value: machine, mono: true, segment: 2, hint: '5-byte random value per process (post-3.4)' },
        { label: 'Counter', value: String(counter), mono: true, segment: 3 },
      ],
      layout: {
        bytes,
        segments: [
          { label: '4-byte timestamp', start: 0, end: 4, color: 1 },
          { label: '5-byte process random', start: 4, end: 9, color: 2 },
          { label: '3-byte counter', start: 9, end: 12, color: 3 },
        ],
      },
      reference: { label: 'MongoDB ObjectId docs', url: 'https://www.mongodb.com/docs/manual/reference/method/ObjectId/' },
    };
  },
};
