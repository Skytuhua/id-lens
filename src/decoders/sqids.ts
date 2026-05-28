import type { Decoder, DecodeResult, Confidence } from '../types';

// Sqids / Hashids: short, opaque, alphabet-shuffled IDs. We can only describe
// them without the alphabet + salt; decoding is not possible without those.
const SHORT_ALNUM_RE = /^[A-Za-z0-9]{3,16}$/;

export const sqidsDecoder: Decoder = {
  id: 'sqids',
  name: 'Sqids / Hashids',

  matches(input: string): Confidence | null {
    const s = input.trim();
    if (!SHORT_ALNUM_RE.test(s)) return null;
    if (s.length >= 12) return null; // Too long to be a typical Sqid
    // Very low confidence — many short strings look like this.
    return 'low';
  },

  decode(input: string): DecodeResult {
    const s = input.trim();
    return {
      format: 'Sqids / Hashids (likely)',
      formatId: 'sqids',
      confidence: 'low',
      summary: 'Short alphanumeric token — could be a Sqid, Hashid, YouTube-style ID, or short URL slug. Decoding requires the original alphabet and salt.',
      fields: [
        { label: 'Canonical', value: s, mono: true, copyable: true },
        { label: 'Length', value: String(s.length) },
        { label: 'Charset', value: 'A-Z a-z 0-9', mono: true },
      ],
      warnings: ['Without the issuer\'s alphabet and salt, no fields can be recovered.'],
      reference: { label: 'Sqids', url: 'https://sqids.org/' },
    };
  },
};
