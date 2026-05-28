import { describe, it, expect } from 'vitest';
import { stripeDecoder } from '../../src/decoders/stripe';

describe('Stripe decoder', () => {
  it('matches known prefixes with high confidence', () => {
    expect(stripeDecoder.matches('cus_NeZwdNtLEOXuvB')).toBe('high');
    expect(stripeDecoder.matches('pi_3MtwBwLkdIwHu7ix28a3tqPa')).toBe('high');
    expect(stripeDecoder.matches('sub_1MowQVLkdIwHu7ixeRlqHVzs')).toBe('high');
  });

  it('detects test-mode keys', () => {
    const r = stripeDecoder.decode('sk_test_FAKEexample00000000000000');
    expect(r.fields.find((f) => f.label === 'Mode')!.value).toBe('TEST');
    expect(r.fields.find((f) => f.label === 'Object type')!.value).toContain('Secret API Key');
    expect(r.warnings).toBeDefined();
  });

  it('detects live-mode keys', () => {
    const r = stripeDecoder.decode('pk_live_FAKEexample00000000000000');
    expect(r.fields.find((f) => f.label === 'Mode')!.value).toBe('LIVE');
  });

  it('falls back to medium for unknown prefixes that match the shape', () => {
    expect(stripeDecoder.matches('zz_abcdefgh')).toBe('medium');
  });

  it('rejects non-stripe shapes', () => {
    expect(stripeDecoder.matches('507f1f77bcf86cd799439011')).toBeNull();
    expect(stripeDecoder.matches('hello_world')).toBeNull(); // too-short body
  });
});
