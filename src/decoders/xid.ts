import type { Decoder, DecodeResult, Confidence } from '../types';
import { unixSecToIso, ago } from '../lib/time';

// Xid: 12-byte ID, encoded as 20 chars of lowercase base32-hex (alphabet 0-9 a-v).
// Layout: 4-byte unix timestamp + 3-byte machine + 2-byte pid + 3-byte counter.
const XID_RE = /^[0-9a-v]{20}$/;
const BASE32_HEX = '0123456789abcdefghijklmnopqrstuv';
const DECODE_TABLE: Record<string, number> = (() => {
  const t: Record<string, number> = {};
  for (let i = 0; i < BASE32_HEX.length; i++) t[BASE32_HEX[i]] = i;
  return t;
})();

function decodeXid(s: string): number[] {
  // Xid uses a custom 5-bit packing across 20 base32 chars -> 12 bytes.
  // Reference: github.com/rs/xid — encode function.
  const i = s.split('').map((c) => DECODE_TABLE[c]);
  const b: number[] = new Array(12);
  b[0] = (i[0] << 3) | (i[1] >> 2);
  b[1] = (i[1] << 6) | (i[2] << 1) | (i[3] >> 4);
  b[2] = (i[3] << 4) | (i[4] >> 1);
  b[3] = (i[4] << 7) | (i[5] << 2) | (i[6] >> 3);
  b[4] = (i[6] << 5) | i[7];
  b[5] = (i[8] << 3) | (i[9] >> 2);
  b[6] = (i[9] << 6) | (i[10] << 1) | (i[11] >> 4);
  b[7] = (i[11] << 4) | (i[12] >> 1);
  b[8] = (i[12] << 7) | (i[13] << 2) | (i[14] >> 3);
  b[9] = (i[14] << 5) | i[15];
  b[10] = (i[16] << 3) | (i[17] >> 2);
  b[11] = (i[17] << 6) | (i[18] << 1) | (i[19] >> 4);
  return b.map((x) => x & 0xff);
}

export const xidDecoder: Decoder = {
  id: 'xid',
  name: 'Xid',

  matches(input: string): Confidence | null {
    const s = input.trim();
    if (!XID_RE.test(s)) return null;
    try {
      const b = decodeXid(s);
      const ts = (b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3];
      const now = Math.floor(Date.now() / 1000);
      if (ts < 1230768000 || ts > now + 50 * 365 * 86400) return 'low';
      return 'high';
    } catch {
      return null;
    }
  },

  decode(input: string): DecodeResult {
    const s = input.trim().toLowerCase();
    const b = decodeXid(s);
    const ts = (b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3];
    const machine = b
      .slice(4, 7)
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('');
    const pid = (b[7] << 8) | b[8];
    const counter = (b[9] << 16) | (b[10] << 8) | b[11];
    return {
      format: 'Xid',
      formatId: 'xid',
      confidence: 'high',
      summary: `Xid generated ${ago(ts * 1000)}. 4-byte timestamp + 3-byte machine + 2-byte PID + 3-byte counter.`,
      fields: [
        { label: 'Canonical', value: s, mono: true, copyable: true },
        { label: 'Timestamp', value: unixSecToIso(ts), hint: ago(ts * 1000), mono: true, segment: 1 },
        { label: 'Unix seconds', value: String(ts), mono: true, segment: 1 },
        { label: 'Machine', value: machine, mono: true, segment: 2 },
        { label: 'PID', value: String(pid), mono: true, segment: 2 },
        { label: 'Counter', value: String(counter), mono: true, segment: 3 },
      ],
      layout: {
        bytes: b,
        segments: [
          { label: '4-byte timestamp', start: 0, end: 4, color: 1 },
          { label: '3-byte machine', start: 4, end: 7, color: 2 },
          { label: '2-byte PID', start: 7, end: 9, color: 2 },
          { label: '3-byte counter', start: 9, end: 12, color: 3 },
        ],
      },
      reference: { label: 'rs/xid', url: 'https://github.com/rs/xid' },
    };
  },
};
