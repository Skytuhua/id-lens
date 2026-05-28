import { describe, it, expect } from 'vitest';
import { unixTimeDecoder } from '../../src/decoders/unixtime';

describe('Unix timestamp decoder', () => {
  it('matches a plausible unix-seconds value', () => {
    expect(unixTimeDecoder.matches('1700000000')).not.toBeNull();
  });

  it('matches a plausible unix-ms value', () => {
    expect(unixTimeDecoder.matches('1700000000123')).not.toBeNull();
  });

  it('decodes seconds and ms to identical UTC values', () => {
    const rs = unixTimeDecoder.decode('1700000000');
    const rm = unixTimeDecoder.decode('1700000000000');
    const utcS = rs.fields.find((f) => f.label === 'UTC')!.value;
    const utcM = rm.fields.find((f) => f.label === 'UTC')!.value;
    expect(utcS.slice(0, 19)).toBe(utcM.slice(0, 19));
  });

  it('rejects too-short or too-long numerics', () => {
    expect(unixTimeDecoder.matches('123')).toBeNull();
    expect(unixTimeDecoder.matches('99999999999999999999')).toBeNull();
  });
});
