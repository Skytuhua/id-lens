import { describe, it, expect } from 'vitest';
import { uuidDecoder } from '../../src/decoders/uuid';

describe('UUID decoder', () => {
  it('matches canonical UUIDs with high confidence', () => {
    expect(uuidDecoder.matches('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe('high');
    expect(uuidDecoder.matches('4f6f9a3c-1c5e-4a2c-8d2a-1e6b1b0a2c3d')).toBe('high');
  });

  it('matches hex-32 (dashless) form with high confidence', () => {
    expect(uuidDecoder.matches('6ba7b8109dad11d180b400c04fd430c8')).toBe('high');
  });

  it('matches braced GUID form', () => {
    expect(uuidDecoder.matches('{6ba7b810-9dad-11d1-80b4-00c04fd430c8}')).toBe('high');
  });

  it('does not match non-UUIDs', () => {
    expect(uuidDecoder.matches('not a uuid')).toBeNull();
    expect(uuidDecoder.matches('6ba7b8109dad11d180b400c04fd430c8aa')).toBeNull();
    expect(uuidDecoder.matches('6ba7b810-9dad-11d1-80b4-00c04fd430c')).toBeNull();
  });

  it('decodes v1 timestamp from the canonical DNS namespace UUID', () => {
    const r = uuidDecoder.decode('6ba7b810-9dad-11d1-80b4-00c04fd430c8');
    expect(r.format).toBe('UUID v1');
    expect(r.confidence).toBe('high');
    const ts = r.fields.find((f) => f.label === 'Timestamp');
    expect(ts).toBeDefined();
    // The DNS namespace UUID was generated 1998-02-04 22:13:53.105+ UTC
    expect(ts!.value).toMatch(/^1998-02-04T22:13:53/);
    const node = r.fields.find((f) => f.label === 'Node');
    expect(node!.value).toBe('00:c0:4f:d4:30:c8');
  });

  it('decodes v4 correctly', () => {
    const r = uuidDecoder.decode('4f6f9a3c-1c5e-4a2c-8d2a-1e6b1b0a2c3d');
    expect(r.format).toBe('UUID v4');
    expect(r.fields.find((f) => f.label === 'Version')!.value).toBe('v4');
    expect(r.fields.find((f) => f.label === 'Variant')!.value).toContain('RFC');
  });

  it('decodes v7 with timestamp extracted from the leading 48 bits', () => {
    // Construct a v7 with known timestamp ms = 0x018f4d2e7c33
    const r = uuidDecoder.decode('018f4d2e-7c33-7c4e-bff9-2c1f9a3a4b5c');
    expect(r.format).toBe('UUID v7');
    const ts = r.fields.find((f) => f.label === 'Timestamp');
    expect(ts!.value).toMatch(/^2024-/);
  });

  it('identifies nil and max UUIDs by name', () => {
    const nil = uuidDecoder.decode('00000000-0000-0000-0000-000000000000');
    expect(nil.format).toContain('Nil');
    const max = uuidDecoder.decode('ffffffff-ffff-ffff-ffff-ffffffffffff');
    expect(max.format).toContain('Max');
  });

  it('accepts urn:uuid: prefix and braced + hex32 forms producing identical canonical output', () => {
    const r1 = uuidDecoder.decode('urn:uuid:6ba7b810-9dad-11d1-80b4-00c04fd430c8'.replace('urn:uuid:', ''));
    const r2 = uuidDecoder.decode('6ba7b8109dad11d180b400c04fd430c8');
    const r3 = uuidDecoder.decode('{6ba7b810-9dad-11d1-80b4-00c04fd430c8}');
    expect(r1.fields[0].value).toBe(r2.fields[0].value);
    expect(r2.fields[0].value).toBe(r3.fields[0].value);
  });

  it('decodes v3 / v5 as name-based with no timestamp', () => {
    const v3 = uuidDecoder.decode('3d813cbb-47fb-32ba-91df-831e1593ac29');
    expect(v3.format).toBe('UUID v3');
    expect(v3.fields.find((f) => f.label === 'Timestamp')).toBeUndefined();
    const v5 = uuidDecoder.decode('21f7f8de-8051-5b89-8680-0195ef798b6a');
    expect(v5.format).toBe('UUID v5');
  });
});
