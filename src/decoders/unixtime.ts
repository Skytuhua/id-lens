import type { Decoder, DecodeResult, Confidence } from '../types';
import { DIGITS_RE } from '../lib/bytes';
import { unixMsToIso, unixSecToIso, ago } from '../lib/time';

const NOW_MS = () => Date.now();

interface Interpretation {
  unit: 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds';
  ms: number;
  raw: string;
}

function interpretations(s: string): Interpretation[] {
  if (!DIGITS_RE.test(s)) return [];
  const out: Interpretation[] = [];
  // Try each unit and keep those landing within ±100y of now.
  const now = NOW_MS();
  const tries: Interpretation['unit'][] = ['seconds', 'milliseconds', 'microseconds', 'nanoseconds'];
  for (const unit of tries) {
    let ms: number;
    if (unit === 'seconds') ms = Number(s) * 1000;
    else if (unit === 'milliseconds') ms = Number(s);
    else if (unit === 'microseconds') ms = Number(s) / 1000;
    else ms = Number(s) / 1_000_000;
    if (!Number.isFinite(ms)) continue;
    const diff = Math.abs(now - ms);
    if (diff < 100 * 365 * 86400 * 1000) {
      out.push({ unit, ms, raw: s });
    }
  }
  return out;
}

export const unixTimeDecoder: Decoder = {
  id: 'unixtime',
  name: 'Unix timestamp',

  matches(input: string): Confidence | null {
    const s = input.trim();
    if (!DIGITS_RE.test(s)) return null;
    if (s.length < 9 || s.length > 19) return null;
    const cands = interpretations(s);
    if (cands.length === 0) return null;
    // High confidence only at canonical lengths for seconds (10) and ms (13).
    // Other lengths (us 15-16, ns 18-19) are nearly always something else,
    // so claim only low confidence — Snowflakes and similar should outrank.
    if (s.length === 10 || s.length === 13) return 'medium';
    return 'low';
  },

  decode(input: string): DecodeResult {
    const s = input.trim();
    const cands = interpretations(s);
    if (cands.length === 0) {
      return {
        format: 'Unix timestamp (out of range)',
        formatId: 'unixtime',
        confidence: 'low',
        summary: 'Numeric input but no Unix-time interpretation lands within ±100 years of now.',
        fields: [{ label: 'Canonical', value: s, mono: true, copyable: true }],
      };
    }
    const primary = cands[0];
    const fields = [
      { label: 'Canonical', value: s, mono: true, copyable: true },
      { label: 'Assumed unit', value: primary.unit },
      {
        label: 'UTC',
        value: primary.unit === 'seconds' ? unixSecToIso(Number(s)) : unixMsToIso(primary.ms),
        hint: ago(primary.ms),
        mono: true,
        segment: 1,
      },
    ];
    if (cands.length > 1) {
      for (let i = 1; i < cands.length; i++) {
        const c = cands[i];
        fields.push({
          label: `Also as ${c.unit}`,
          value: unixMsToIso(c.ms),
          hint: ago(c.ms),
          mono: true,
          segment: 1,
        });
      }
    }

    const confidence: Confidence = s.length === 10 || s.length === 13 ? 'medium' : 'low';
    return {
      format: 'Unix timestamp',
      formatId: 'unixtime',
      confidence,
      summary: `Plausible Unix timestamp in ${cands.length === 1 ? primary.unit : 'multiple possible units'}.`,
      fields,
      warnings: cands.length > 1 ? ['Multiple unit interpretations land within plausible range — pick the right one based on context.'] : undefined,
      reference: { label: 'Unix time (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Unix_time' },
    };
  },
};
