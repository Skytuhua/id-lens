import type { Decoder, DecodeResult, Confidence } from '../types';
import { DIGITS_RE } from '../lib/bytes';
import { unixMsToIso, ago } from '../lib/time';

// Snowflake variants we know about.
interface SnowflakeVariant {
  id: string;
  name: string;
  epoch: number;            // unix ms
  workerBits: number;       // total non-timestamp non-sequence top bits (machine+worker)
  workerLabel: string;      // human label for the machine field(s)
  sequenceBits: number;
  decodeWorker(workerRaw: number): { fields: { label: string; value: string }[]; segments: { label: string; bits: number }[] };
  reference: { label: string; url: string };
}

function splitTwitterWorker(workerRaw: number) {
  const datacenter = (workerRaw >> 5) & 0x1f;
  const worker = workerRaw & 0x1f;
  return {
    fields: [
      { label: 'Datacenter ID', value: String(datacenter) },
      { label: 'Worker ID', value: String(worker) },
    ],
    segments: [
      { label: 'datacenter (5b)', bits: 5 },
      { label: 'worker (5b)', bits: 5 },
    ],
  };
}

function splitDiscordWorker(workerRaw: number) {
  const worker = (workerRaw >> 5) & 0x1f;
  const process = workerRaw & 0x1f;
  return {
    fields: [
      { label: 'Worker ID', value: String(worker) },
      { label: 'Process ID', value: String(process) },
    ],
    segments: [
      { label: 'worker (5b)', bits: 5 },
      { label: 'process (5b)', bits: 5 },
    ],
  };
}

function splitInstagramWorker(workerRaw: number) {
  const shard = workerRaw & 0x1fff;
  return {
    fields: [{ label: 'Shard ID', value: String(shard) }],
    segments: [{ label: 'shard (13b)', bits: 13 }],
  };
}

const VARIANTS: SnowflakeVariant[] = [
  {
    id: 'snowflake-twitter',
    name: 'Snowflake (Twitter / X)',
    epoch: 1288834974657, // 2010-11-04 01:42:54.657 UTC — Twitter's published epoch
    workerBits: 10,
    workerLabel: 'datacenter + worker',
    sequenceBits: 12,
    decodeWorker: splitTwitterWorker,
    reference: { label: 'Twitter Snowflake', url: 'https://github.com/twitter-archive/snowflake/tree/snowflake-2010' },
  },
  {
    id: 'snowflake-discord',
    name: 'Snowflake (Discord)',
    epoch: 1420070400000, // 2015-01-01 UTC
    workerBits: 10,
    workerLabel: 'worker + process',
    sequenceBits: 12,
    decodeWorker: splitDiscordWorker,
    reference: { label: 'Discord ID format', url: 'https://discord.com/developers/docs/reference#snowflakes' },
  },
  {
    id: 'snowflake-instagram',
    name: 'Snowflake (Instagram)',
    epoch: 1314220021721, // 2011-09-09 ~01:07 UTC — Instagram's documented shard epoch
    workerBits: 13,
    workerLabel: 'shard',
    sequenceBits: 10,
    decodeWorker: splitInstagramWorker,
    reference: { label: 'Instagram sharded IDs', url: 'https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c' },
  },
];

function tryVariant(value: bigint, v: SnowflakeVariant): { ms: number; workerRaw: number; sequence: number } | null {
  const totalLowBits = BigInt(v.workerBits + v.sequenceBits);
  const ms = Number((value >> totalLowBits)) + v.epoch;
  if (ms < v.epoch - 1000) return null;
  // Reject if "timestamp" would be in the very distant future (more than 50 years out)
  if (ms > Date.now() + 50 * 365 * 86400 * 1000) return null;
  const workerMask = (1n << BigInt(v.workerBits)) - 1n;
  const workerRaw = Number((value >> BigInt(v.sequenceBits)) & workerMask);
  const sequence = Number(value & ((1n << BigInt(v.sequenceBits)) - 1n));
  return { ms, workerRaw, sequence };
}

function buildResult(v: SnowflakeVariant, raw: string, parsed: { ms: number; workerRaw: number; sequence: number }, confidence: Confidence): DecodeResult {
  const w = v.decodeWorker(parsed.workerRaw);
  const tsIso = unixMsToIso(parsed.ms);
  return {
    format: v.name,
    formatId: v.id,
    confidence,
    summary: `${v.name} generated ${ago(parsed.ms)}. Epoch-adjusted ms timestamp + ${v.workerLabel} + sequence.`,
    fields: [
      { label: 'Canonical', value: raw, mono: true, copyable: true },
      { label: 'Timestamp', value: tsIso, hint: ago(parsed.ms), mono: true, segment: 1 },
      { label: 'Unix ms', value: String(parsed.ms), mono: true, segment: 1 },
      ...w.fields.map((f) => ({ ...f, mono: true, segment: 2 })),
      { label: 'Sequence', value: String(parsed.sequence), mono: true, segment: 3 },
    ],
    reference: v.reference,
  };
}

export const snowflakeDecoder: Decoder = {
  id: 'snowflake',
  name: 'Snowflake',

  matches(input: string): Confidence | null {
    const s = input.trim();
    if (!DIGITS_RE.test(s)) return null;
    if (s.length < 8 || s.length > 20) return null;
    let n: bigint;
    try {
      n = BigInt(s);
    } catch {
      return null;
    }
    if (n < 0n) return null;
    // Must be within 63 bits to be a snowflake
    if (n >> 63n !== 0n) return null;
    for (const v of VARIANTS) {
      const r = tryVariant(n, v);
      if (r && r.ms > v.epoch + 1) {
        // High confidence if the inferred date is within the last 20 years and
        // the number is the canonical 17-19 digit length; medium otherwise.
        const recent = r.ms >= Date.now() - 20 * 365 * 86400 * 1000;
        const canonicalLen = s.length >= 17 && s.length <= 19;
        return recent && canonicalLen ? 'high' : 'medium';
      }
    }
    return null;
  },

  decode(input: string): DecodeResult {
    const raw = input.trim();
    const n = BigInt(raw);
    // Try all variants; pick whichever yields a timestamp closest to "now" but not in the future.
    const now = Date.now();
    const candidates: { v: SnowflakeVariant; r: { ms: number; workerRaw: number; sequence: number } }[] = [];
    for (const v of VARIANTS) {
      const r = tryVariant(n, v);
      if (r && r.ms <= now + 365 * 86400 * 1000) {
        candidates.push({ v, r });
      }
    }
    if (candidates.length === 0) {
      // Fall back to Twitter epoch even if implausible
      const r = tryVariant(n, VARIANTS[0])!;
      return buildResult(VARIANTS[0], raw, r, 'low');
    }
    candidates.sort((a, b) => {
      const da = Math.abs(now - a.r.ms);
      const db = Math.abs(now - b.r.ms);
      return da - db;
    });
    const winner = candidates[0];
    return buildResult(winner.v, raw, winner.r, candidates.length === 1 ? 'medium' : 'medium');
  },
};

export function decodeAllSnowflakeVariants(input: string): DecodeResult[] {
  const raw = input.trim();
  if (!DIGITS_RE.test(raw)) return [];
  if (raw.length < 8 || raw.length > 20) return [];
  let n: bigint;
  try {
    n = BigInt(raw);
  } catch {
    return [];
  }
  if (n < 0n || n >> 63n !== 0n) return [];
  const now = Date.now();
  type Entry = { result: DecodeResult; ms: number };
  const entries: Entry[] = [];
  const canonicalLen = raw.length >= 17 && raw.length <= 19;
  for (const v of VARIANTS) {
    const r = tryVariant(n, v);
    if (r && r.ms <= now + 365 * 86400 * 1000) {
      const recent = r.ms >= now - 20 * 365 * 86400 * 1000;
      entries.push({
        result: buildResult(v, raw, r, recent && canonicalLen ? 'high' : 'medium'),
        ms: r.ms,
      });
    }
  }
  // Rank interpretations: past dates beat future dates; among past dates the
  // most recent wins (matches documented Discord/Instagram examples which post-
  // date the Twitter epoch). Among future dates the one closest to now wins.
  entries.sort((a, b) => {
    const aPast = a.ms <= now;
    const bPast = b.ms <= now;
    if (aPast !== bPast) return aPast ? -1 : 1;
    if (aPast) return b.ms - a.ms; // both past: most recent first
    return a.ms - b.ms;             // both future: nearest first
  });
  return entries.map((e) => e.result);
}
