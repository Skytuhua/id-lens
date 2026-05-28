import type { Decoder, DecodeResult, Confidence } from '../types';

// Default NanoID alphabet: 64 URL-safe characters: A-Z a-z 0-9 _ -
const NANOID_DEFAULT_RE = /^[A-Za-z0-9_-]{4,64}$/;
const NANOID_DEFAULT_ALPHABET_CHARS = /[_-]/; // distinguish from base62-only strings

export const nanoIdDecoder: Decoder = {
  id: 'nanoid',
  name: 'NanoID',

  matches(input: string): Confidence | null {
    const s = input.trim();
    if (!NANOID_DEFAULT_RE.test(s)) return null;
    // Reject UUID-shaped strings (36 chars with 4 dashes at positions 8/13/18/23).
    if (s.length === 36 && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(s)) return null;
    // Reject Stripe-style strings (have a `_` in the middle, not just trailing).
    if (/^[a-z]{2,7}(_test|_live)?_[A-Za-z0-9]+$/.test(s)) return null;
    // Canonical NanoID is exactly 21 chars; only claim medium at that length AND alphabet has _ or -.
    if (s.length === 21 && NANOID_DEFAULT_ALPHABET_CHARS.test(s)) return 'medium';
    if (s.length === 21) return 'low';
    if (NANOID_DEFAULT_ALPHABET_CHARS.test(s)) return 'low';
    return null;
  },

  decode(input: string): DecodeResult {
    const s = input.trim();
    const alphabetSize = 64;
    const entropyBits = Math.log2(alphabetSize) * s.length;
    return {
      format: 'NanoID',
      formatId: 'nanoid',
      confidence: s.length === 21 ? 'medium' : 'low',
      summary: `Likely a NanoID — ${s.length} chars from the URL-safe alphabet, ≈ ${entropyBits.toFixed(0)} bits of entropy.`,
      fields: [
        { label: 'Canonical', value: s, mono: true, copyable: true },
        { label: 'Length', value: String(s.length) },
        { label: 'Alphabet', value: 'A-Z a-z 0-9 _ -', mono: true, hint: 'Default NanoID URL-safe alphabet (64 chars)' },
        { label: 'Entropy', value: `~${entropyBits.toFixed(0)} bits` },
      ],
      warnings: ['NanoIDs carry no embedded metadata; only structure is inspectable.'],
      reference: { label: 'NanoID spec', url: 'https://github.com/ai/nanoid' },
    };
  },
};
