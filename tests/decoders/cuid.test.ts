import { describe, it, expect } from 'vitest';
import { cuidDecoder } from '../../src/decoders/cuid';

describe('CUID decoder', () => {
  it('matches CUID v1 with high confidence', () => {
    expect(cuidDecoder.matches('ciyz3jha6000001la5g4k0gpv')).toBe('high');
  });

  it('matches CUID v2 with low confidence', () => {
    expect(cuidDecoder.matches('clh3a4j8x0000xyz123abc4567def')).toBe('low');
  });

  it('decodes CUID v1 timestamp field', () => {
    const r = cuidDecoder.decode('ciyz3jha6000001la5g4k0gpv');
    expect(r.format).toBe('CUID v1');
    expect(r.fields.find((f) => f.label === 'Timestamp')).toBeDefined();
    expect(r.fields.find((f) => f.label === 'Counter')).toBeDefined();
  });

  it('returns opaque v2 result with warnings', () => {
    const r = cuidDecoder.decode('clh3a4j8x0000xyz123abc4567def');
    expect(r.format).toBe('CUID v2');
    expect(r.warnings).toBeDefined();
  });
});
