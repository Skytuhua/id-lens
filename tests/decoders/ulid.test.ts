import { describe, it, expect } from 'vitest';
import { ulidDecoder } from '../../src/decoders/ulid';

describe('ULID decoder', () => {
  it('matches a canonical ULID', () => {
    expect(ulidDecoder.matches('01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe('high');
  });

  it('rejects wrong length', () => {
    expect(ulidDecoder.matches('01ARZ3NDEKTSV4RRFFQ69G5F')).toBeNull();
    expect(ulidDecoder.matches('01ARZ3NDEKTSV4RRFFQ69G5FAVX')).toBeNull();
  });

  it('rejects invalid Crockford characters', () => {
    expect(ulidDecoder.matches('01ARZ3NDEKTSV4RRFFQ69G5FAU')).toBeNull(); // 'U' is excluded
    expect(ulidDecoder.matches('01ARZ3NDEKTSV4RRFFQ69G5FAI')).toBeNull(); // 'I' would alias to 1 but should not be used canonically — but our regex permits it? Actually the regex excludes I L O U so this should be null
  });

  it('decodes the reference ULID timestamp', () => {
    const r = ulidDecoder.decode('01ARZ3NDEKTSV4RRFFQ69G5FAV');
    expect(r.format).toBe('ULID');
    const tsMs = r.fields.find((f) => f.label === 'Timestamp (ms)');
    // 01ARZ3NDEK in Crockford base32 → 1469922850259 ms = 2016-07-30T22:54:10.259Z
    expect(tsMs!.value).toBe('1469922850259');
    const ts = r.fields.find((f) => f.label === 'Timestamp');
    expect(ts!.value).toMatch(/^2016-07-/);
  });

  it('is case-insensitive on decoding', () => {
    const upper = ulidDecoder.decode('01ARZ3NDEKTSV4RRFFQ69G5FAV');
    const lower = ulidDecoder.decode('01arz3ndektsv4rrffq69g5fav');
    expect(upper.fields.find((f) => f.label === 'Timestamp (ms)')!.value).toBe(
      lower.fields.find((f) => f.label === 'Timestamp (ms)')!.value,
    );
  });
});
