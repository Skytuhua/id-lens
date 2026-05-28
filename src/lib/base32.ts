// Crockford Base32 used by ULID. Decoding is case-insensitive; encoding is uppercase.
// Alphabet excludes I, L, O, U to avoid ambiguity.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

const DECODE_TABLE: Record<string, number> = (() => {
  const t: Record<string, number> = {};
  for (let i = 0; i < ALPHABET.length; i++) {
    t[ALPHABET[i]] = i;
    t[ALPHABET[i].toLowerCase()] = i;
  }
  // Common aliases per Crockford spec
  t['o'] = 0;
  t['O'] = 0;
  t['i'] = 1;
  t['I'] = 1;
  t['l'] = 1;
  t['L'] = 1;
  return t;
})();

export const CROCKFORD_ALPHABET_RE = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]+$/;

export function isCrockfordBase32(s: string): boolean {
  return CROCKFORD_ALPHABET_RE.test(s);
}

export function decodeCrockford(s: string): bigint {
  let n = 0n;
  for (const ch of s) {
    const v = DECODE_TABLE[ch];
    if (v === undefined) {
      throw new Error(`invalid Crockford base32 character: ${ch}`);
    }
    n = (n << 5n) | BigInt(v);
  }
  return n;
}

export function encodeCrockford(n: bigint, length: number): string {
  let v = n;
  const out: string[] = [];
  for (let i = 0; i < length; i++) {
    out.push(ALPHABET[Number(v & 31n)]);
    v >>= 5n;
  }
  return out.reverse().join('');
}
