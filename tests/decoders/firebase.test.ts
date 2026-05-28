import { describe, it, expect } from 'vitest';
import { firebaseDecoder } from '../../src/decoders/firebase';

describe('Firebase push ID decoder', () => {
  it('matches and decodes a plausible Firebase ID', () => {
    // 20 chars from the firebase alphabet; first 8 must decode to a plausible
    // timestamp. Manually constructed: "-O" -> some recent ms
    expect(firebaseDecoder.matches('-N4l6vM7gZpQ8nB2cD9E')).toBe('high');
    const r = firebaseDecoder.decode('-N4l6vM7gZpQ8nB2cD9E');
    expect(r.format).toBe('Firebase push ID');
    expect(r.fields.find((f) => f.label === 'Timestamp')).toBeDefined();
  });

  it('rejects strings of wrong length', () => {
    expect(firebaseDecoder.matches('-N4l6vM7gZ')).toBeNull();
  });
});
