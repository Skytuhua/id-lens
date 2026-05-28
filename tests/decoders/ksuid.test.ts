import { describe, it, expect } from 'vitest';
import { ksuidDecoder } from '../../src/decoders/ksuid';

describe('KSUID decoder', () => {
  it('matches a canonical KSUID with high confidence', () => {
    // Segment docs reference KSUID
    expect(ksuidDecoder.matches('1srOrx2ZWZBpBUvZwXKQmoEYga2')).toBe('high');
  });

  it('rejects wrong length / wrong alphabet', () => {
    expect(ksuidDecoder.matches('1srOrx2ZWZBpBUvZwXKQmoEYga')).toBeNull();
    expect(ksuidDecoder.matches('1srOrx2ZWZBpBUvZwXKQmoEYga2X')).toBeNull();
    expect(ksuidDecoder.matches('1srOrx2ZWZBpBUvZwXKQmoEYga!')).toBeNull();
  });

  it('decodes timestamp field correctly', () => {
    const r = ksuidDecoder.decode('1srOrx2ZWZBpBUvZwXKQmoEYga2');
    expect(r.format).toBe('KSUID');
    const ts = r.fields.find((f) => f.label === 'Timestamp');
    expect(ts).toBeDefined();
    // Must be a real date in the KSUID era (post-2014 epoch).
    expect(ts!.value).toMatch(/^20[12]\d-/);
  });
});
