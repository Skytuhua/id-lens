export function hexToBytes(hex: string): number[] {
  const clean = hex.replace(/[^0-9a-fA-F]/g, '');
  if (clean.length % 2 !== 0) {
    throw new Error('hex string has odd length');
  }
  const out: number[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    out.push(parseInt(clean.slice(i, i + 2), 16));
  }
  return out;
}

export function bytesToHex(bytes: number[] | Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, '0');
  }
  return out;
}

export function bytesToBigInt(bytes: number[]): bigint {
  let n = 0n;
  for (const b of bytes) {
    n = (n << 8n) | BigInt(b);
  }
  return n;
}

export function bigIntToBytes(n: bigint, length: number): number[] {
  const out: number[] = new Array(length).fill(0);
  let v = n;
  for (let i = length - 1; i >= 0; i--) {
    out[i] = Number(v & 0xffn);
    v >>= 8n;
  }
  return out;
}

export const HEX_RE = /^[0-9a-fA-F]+$/;
export const DIGITS_RE = /^[0-9]+$/;

export function stripWrap(s: string): string {
  let t = s.trim();
  if (t.length >= 2) {
    const first = t[0];
    const last = t[t.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'") || (first === '`' && last === '`')) {
      t = t.slice(1, -1).trim();
    }
  }
  if (t.toLowerCase().startsWith('urn:uuid:')) {
    t = t.slice(9).trim();
  }
  return t;
}
