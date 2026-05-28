import type { Decoder, DecodeResult, DecodedField, Confidence } from '../types';
import { hexToBytes, bytesToBigInt, bytesToHex } from '../lib/bytes';
import { unixMsToIso, uuidV1TimestampToIso, ago } from '../lib/time';

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const UUID_HEX32_RE = /^[0-9a-fA-F]{32}$/;
const UUID_BRACED_RE = /^\{[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\}$/;

function normalise(input: string): string | null {
  let s = input.trim();
  if (UUID_BRACED_RE.test(s)) s = s.slice(1, -1);
  if (UUID_RE.test(s)) return s.toLowerCase();
  if (UUID_HEX32_RE.test(s)) {
    const lower = s.toLowerCase();
    return `${lower.slice(0, 8)}-${lower.slice(8, 12)}-${lower.slice(12, 16)}-${lower.slice(16, 20)}-${lower.slice(20)}`;
  }
  return null;
}

function variant(byte8: number): { label: string; hint: string } {
  const top = byte8 >> 5;
  if (top <= 0b011) return { label: 'NCS (legacy)', hint: 'Apollo NCS backwards-compatible variant' };
  if (top <= 0b101) return { label: 'RFC 9562 (10x)', hint: 'Standard modern UUID variant' };
  if (top === 0b110) return { label: 'Microsoft (110x)', hint: 'Microsoft GUID variant' };
  return { label: 'Reserved (111x)', hint: 'Reserved for future definition' };
}

function isNilOrMax(bytes: number[]): 'nil' | 'max' | null {
  if (bytes.every((b) => b === 0)) return 'nil';
  if (bytes.every((b) => b === 0xff)) return 'max';
  return null;
}

function makeLayout(bytes: number[], version: number): DecodeResult['layout'] {
  const segments: { label: string; start: number; end: number; color: number }[] = [];
  switch (version) {
    case 1:
    case 6: {
      segments.push({ label: 'timestamp', start: 0, end: 8, color: 1 });
      segments.push({ label: 'clock_seq', start: 8, end: 10, color: 3 });
      segments.push({ label: 'node (MAC)', start: 10, end: 16, color: 2 });
      break;
    }
    case 7: {
      segments.push({ label: 'unix_ms', start: 0, end: 6, color: 1 });
      segments.push({ label: 'rand_a', start: 6, end: 8, color: 4 });
      segments.push({ label: 'rand_b', start: 8, end: 16, color: 4 });
      break;
    }
    case 3:
    case 5: {
      segments.push({ label: 'name hash', start: 0, end: 16, color: 4 });
      break;
    }
    case 4: {
      segments.push({ label: 'random', start: 0, end: 16, color: 4 });
      break;
    }
    case 8: {
      segments.push({ label: 'custom', start: 0, end: 16, color: 4 });
      break;
    }
    default: {
      segments.push({ label: 'data', start: 0, end: 16, color: 4 });
    }
  }
  return { bytes, segments };
}

function decodeV1Timestamp(bytes: number[]): bigint {
  // Layout: time_low (4 bytes) | time_mid (2) | time_hi_and_version (2)
  const timeLow = BigInt(bytes[0]) << 24n | BigInt(bytes[1]) << 16n | BigInt(bytes[2]) << 8n | BigInt(bytes[3]);
  const timeMid = BigInt(bytes[4]) << 8n | BigInt(bytes[5]);
  const timeHi = (BigInt(bytes[6] & 0x0f) << 8n) | BigInt(bytes[7]);
  return (timeHi << 48n) | (timeMid << 32n) | timeLow;
}

function decodeV6Timestamp(bytes: number[]): bigint {
  // v6: time_high_and_version | time_mid | time_low_and_version
  // time_high (32 bits) at bytes[0..3], time_mid (16 bits) at bytes[4..5], time_low (12 bits, low nibble of byte6 + byte7)
  const high = BigInt(bytes[0]) << 24n | BigInt(bytes[1]) << 16n | BigInt(bytes[2]) << 8n | BigInt(bytes[3]);
  const mid = BigInt(bytes[4]) << 8n | BigInt(bytes[5]);
  const low = (BigInt(bytes[6] & 0x0f) << 8n) | BigInt(bytes[7]);
  return (high << 28n) | (mid << 12n) | low;
}

function decodeV7Timestamp(bytes: number[]): bigint {
  // First 48 bits = Unix ms.
  let t = 0n;
  for (let i = 0; i < 6; i++) t = (t << 8n) | BigInt(bytes[i]);
  return t;
}

function formatMacOrNode(nodeBytes: number[]): string {
  return nodeBytes.map((b) => b.toString(16).padStart(2, '0')).join(':');
}

export const uuidDecoder: Decoder = {
  id: 'uuid',
  name: 'UUID',

  matches(input: string): Confidence | null {
    const s = input.trim();
    if (UUID_RE.test(s) || UUID_BRACED_RE.test(s) || UUID_HEX32_RE.test(s)) return 'high';
    return null;
  },

  decode(input: string): DecodeResult {
    const canonical = normalise(input);
    if (!canonical) {
      throw new Error('not a UUID');
    }
    const bytes = hexToBytes(canonical);
    const sentinel = isNilOrMax(bytes);
    if (sentinel === 'nil') {
      return {
        format: 'UUID — Nil',
        formatId: 'uuid',
        confidence: 'high',
        summary: 'The all-zero UUID. Used as a sentinel "no value" placeholder.',
        fields: [
          { label: 'Canonical', value: canonical, mono: true, copyable: true },
          { label: 'Sentinel', value: 'nil UUID' },
        ],
        layout: { bytes, segments: [{ label: 'all zero', start: 0, end: 16, color: 0 }] },
        reference: { label: 'RFC 9562 §5.9 Nil UUID', url: 'https://www.rfc-editor.org/rfc/rfc9562#name-nil-uuid' },
      };
    }
    if (sentinel === 'max') {
      return {
        format: 'UUID — Max',
        formatId: 'uuid',
        confidence: 'high',
        summary: 'The all-ones UUID. Used as a sentinel "maximum" placeholder.',
        fields: [
          { label: 'Canonical', value: canonical, mono: true, copyable: true },
          { label: 'Sentinel', value: 'max UUID' },
        ],
        layout: { bytes, segments: [{ label: 'all ones', start: 0, end: 16, color: 0 }] },
        reference: { label: 'RFC 9562 §5.10 Max UUID', url: 'https://www.rfc-editor.org/rfc/rfc9562#name-max-uuid' },
      };
    }

    const version = bytes[6] >> 4;
    const variantInfo = variant(bytes[8]);
    const fields: DecodedField[] = [
      { label: 'Canonical', value: canonical, mono: true, copyable: true },
      { label: 'Version', value: `v${version}` },
      { label: 'Variant', value: variantInfo.label, hint: variantInfo.hint },
    ];

    let summary = '';
    const warnings: string[] = [];

    switch (version) {
      case 1: {
        const t = decodeV1Timestamp(bytes);
        const iso = uuidV1TimestampToIso(t);
        const ms = Math.floor(Number((t - 122192928000000000n) / 10000n));
        const clockSeq = ((bytes[8] & 0x3f) << 8) | bytes[9];
        const nodeBytes = bytes.slice(10, 16);
        const multicast = (nodeBytes[0] & 0x01) === 1;
        fields.push({ label: 'Timestamp', value: iso, hint: ago(ms), mono: true, segment: 1 });
        fields.push({ label: 'Clock seq', value: String(clockSeq), mono: true, segment: 3 });
        fields.push({ label: 'Node', value: formatMacOrNode(nodeBytes), mono: true, segment: 2, hint: multicast ? 'multicast bit set — usually a randomised pseudo-MAC' : 'real MAC address (or unicast pseudo-node)' });
        summary = `Time-based UUID v1, generated ${ago(ms)}.`;
        break;
      }
      case 2: {
        // DCE Security (rare)
        summary = 'DCE Security UUID v2. Rare in modern use; v1 fields are partially overwritten with POSIX UID/GID.';
        warnings.push('UUIDv2 is rarely used outside legacy DCE systems and lacks a portable timestamp interpretation.');
        break;
      }
      case 3: {
        fields.push({ label: 'Algorithm', value: 'MD5', mono: true });
        summary = 'Name-based UUID v3 (MD5 hash of a namespace + name). No embedded timestamp.';
        break;
      }
      case 4: {
        summary = 'Random UUID v4. 122 bits of randomness — no embedded metadata.';
        break;
      }
      case 5: {
        fields.push({ label: 'Algorithm', value: 'SHA-1', mono: true });
        summary = 'Name-based UUID v5 (SHA-1 hash of a namespace + name). No embedded timestamp.';
        break;
      }
      case 6: {
        const t = decodeV6Timestamp(bytes);
        const iso = uuidV1TimestampToIso(t);
        const ms = Math.floor(Number((t - 122192928000000000n) / 10000n));
        const clockSeq = ((bytes[8] & 0x3f) << 8) | bytes[9];
        const nodeBytes = bytes.slice(10, 16);
        fields.push({ label: 'Timestamp', value: iso, hint: ago(ms), mono: true, segment: 1 });
        fields.push({ label: 'Clock seq', value: String(clockSeq), mono: true, segment: 3 });
        fields.push({ label: 'Node', value: formatMacOrNode(nodeBytes), mono: true, segment: 2 });
        summary = `Reordered time-based UUID v6, generated ${ago(ms)}. Sorts lexicographically by time.`;
        break;
      }
      case 7: {
        const ms = Number(decodeV7Timestamp(bytes));
        const iso = unixMsToIso(ms);
        const randA = ((bytes[6] & 0x0f) << 8) | bytes[7];
        const randB = bytesToHex(bytes.slice(8, 16));
        fields.push({ label: 'Timestamp', value: iso, hint: ago(ms), mono: true, segment: 1 });
        fields.push({ label: 'Rand A', value: randA.toString(16).padStart(3, '0'), mono: true, segment: 4 });
        fields.push({ label: 'Rand B', value: randB, mono: true, segment: 4 });
        summary = `Time-ordered UUID v7, generated ${ago(ms)}. Embedded Unix-ms timestamp + 74 bits random.`;
        break;
      }
      case 8: {
        fields.push({ label: 'Custom payload', value: bytesToHex(bytes), mono: true });
        summary = 'Vendor-defined UUID v8. Layout is implementation-specific.';
        warnings.push('v8 layouts are vendor-defined; ID Lens cannot interpret custom fields.');
        break;
      }
      default: {
        summary = `Unknown UUID version (v${version}).`;
        warnings.push(`Version ${version} is not defined in RFC 9562.`);
      }
    }

    const integer = bytesToBigInt(bytes).toString();
    fields.push({ label: 'Integer', value: integer, mono: true });
    fields.push({ label: 'Hex (no dashes)', value: bytesToHex(bytes), mono: true });

    return {
      format: `UUID v${version}`,
      formatId: 'uuid',
      confidence: 'high',
      summary,
      fields,
      layout: makeLayout(bytes, version),
      warnings: warnings.length ? warnings : undefined,
      reference: { label: 'RFC 9562 (UUID)', url: 'https://www.rfc-editor.org/rfc/rfc9562' },
    };
  },
};
