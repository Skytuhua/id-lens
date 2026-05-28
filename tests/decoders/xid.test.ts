import { describe, it, expect } from 'vitest';
import { xidDecoder } from '../../src/decoders/xid';

describe('Xid decoder', () => {
  it('matches a canonical Xid', () => {
    // From rs/xid README
    expect(xidDecoder.matches('9m4e2mr0ui3e8a215n4g')).toBe('high');
  });

  it('rejects wrong alphabet / length', () => {
    expect(xidDecoder.matches('9M4E2MR0UI3E8A215N4G')).toBeNull(); // uppercase
    expect(xidDecoder.matches('9m4e2mr0ui3e8a215n4')).toBeNull();
  });

  it('decodes fields', () => {
    const r = xidDecoder.decode('9m4e2mr0ui3e8a215n4g');
    expect(r.format).toBe('Xid');
    expect(r.fields.find((f) => f.label === 'Timestamp')).toBeDefined();
    expect(r.fields.find((f) => f.label === 'Machine')).toBeDefined();
    expect(r.fields.find((f) => f.label === 'Counter')).toBeDefined();
  });
});
