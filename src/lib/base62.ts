// Base62 used by KSUID. Alphabet: 0-9, A-Z, a-z.
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const DECODE_TABLE: Record<string, number> = (() => {
  const t: Record<string, number> = {};
  for (let i = 0; i < ALPHABET.length; i++) {
    t[ALPHABET[i]] = i;
  }
  return t;
})();

export const BASE62_ALPHABET_RE = /^[0-9A-Za-z]+$/;

export function isBase62(s: string): boolean {
  return BASE62_ALPHABET_RE.test(s);
}

export function decodeBase62(s: string): bigint {
  let n = 0n;
  const base = 62n;
  for (const ch of s) {
    const v = DECODE_TABLE[ch];
    if (v === undefined) {
      throw new Error(`invalid base62 character: ${ch}`);
    }
    n = n * base + BigInt(v);
  }
  return n;
}

export function encodeBase62(n: bigint, length: number): string {
  if (n < 0n) throw new Error('negative bigint');
  const base = 62n;
  let v = n;
  const out: string[] = [];
  while (v > 0n) {
    const r = Number(v % base);
    out.push(ALPHABET[r]);
    v = v / base;
  }
  while (out.length < length) out.push('0');
  return out.reverse().join('');
}
