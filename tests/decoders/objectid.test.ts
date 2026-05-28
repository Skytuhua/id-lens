import { describe, it, expect } from 'vitest';
import { objectIdDecoder } from '../../src/decoders/objectid';

describe('MongoDB ObjectId decoder', () => {
  it('matches a canonical 24-hex ObjectId', () => {
    expect(objectIdDecoder.matches('507f1f77bcf86cd799439011')).toBe('high');
  });

  it('rejects non-hex / wrong length', () => {
    expect(objectIdDecoder.matches('507f1f77bcf86cd79943901')).toBeNull();
    expect(objectIdDecoder.matches('507f1f77bcf86cd799439011aa')).toBeNull();
    expect(objectIdDecoder.matches('zzzzzz77bcf86cd799439011')).toBeNull();
  });

  it('decodes the timestamp field', () => {
    const r = objectIdDecoder.decode('507f1f77bcf86cd799439011');
    expect(r.format).toBe('MongoDB ObjectId');
    const ts = r.fields.find((f) => f.label === 'Timestamp');
    expect(ts).toBeDefined();
    // 0x507f1f77 = 1350508407 = 2012-10-17T21:13:27Z
    expect(ts!.value).toBe('2012-10-17T21:13:27.000Z');
  });

  it('extracts counter', () => {
    const r = objectIdDecoder.decode('507f1f77bcf86cd799439011');
    const counter = r.fields.find((f) => f.label === 'Counter');
    // last 3 bytes = 439011 hex
    expect(counter!.value).toBe(String(0x439011));
  });
});
