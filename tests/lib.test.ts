import { describe, it, expect } from 'vitest';
import { hexToBytes, bytesToHex, bytesToBigInt, bigIntToBytes, stripWrap } from '../src/lib/bytes';
import { decodeCrockford, encodeCrockford } from '../src/lib/base32';
import { decodeBase62, encodeBase62 } from '../src/lib/base62';

describe('bytes', () => {
  it('round-trips hex / bytes', () => {
    const hex = 'deadbeefcafef00d';
    expect(bytesToHex(hexToBytes(hex))).toBe(hex);
  });
  it('round-trips bigint / bytes', () => {
    const n = 0xdeadbeefcafef00d12345678n;
    const b = bigIntToBytes(n, 12);
    expect(bytesToBigInt(b)).toBe(n);
  });
  it('stripWrap removes quotes and urn:uuid prefix', () => {
    expect(stripWrap('"abc"')).toBe('abc');
    expect(stripWrap('urn:uuid:6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe('6ba7b810-9dad-11d1-80b4-00c04fd430c8');
  });
});

describe('Crockford base32', () => {
  it('round-trips small values', () => {
    expect(decodeCrockford('00000000000000000000000001').toString()).toBe('1');
    expect(encodeCrockford(1n, 26)).toBe('00000000000000000000000001');
  });
  it('aliases I=1, L=1, O=0', () => {
    expect(decodeCrockford('I')).toBe(1n);
    expect(decodeCrockford('L')).toBe(1n);
    expect(decodeCrockford('O')).toBe(0n);
  });
});

describe('Base62', () => {
  it('round-trips small values', () => {
    expect(decodeBase62('0').toString()).toBe('0');
    expect(decodeBase62('z').toString()).toBe('61');
    expect(encodeBase62(61n, 1)).toBe('z');
    expect(encodeBase62(62n, 2)).toBe('10');
  });
});
