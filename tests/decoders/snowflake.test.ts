import { describe, it, expect } from 'vitest';
import { snowflakeDecoder, decodeAllSnowflakeVariants } from '../../src/decoders/snowflake';

describe('Snowflake decoder', () => {
  it('matches a recent canonical-length Discord snowflake with high confidence', () => {
    expect(snowflakeDecoder.matches('175928847299117063')).toBe('high');
  });

  it('rejects non-numeric', () => {
    expect(snowflakeDecoder.matches('abc')).toBeNull();
    expect(snowflakeDecoder.matches('123')).toBeNull(); // too short
  });

  it('decodes the documented Discord example', () => {
    // Discord docs explicitly state this ID corresponds to 2016-04-30T11:18:25.796Z
    const r = snowflakeDecoder.decode('175928847299117063');
    expect(r.formatId).toBe('snowflake-discord');
    const ts = r.fields.find((f) => f.label === 'Timestamp');
    expect(ts!.value.startsWith('2016-04-30T11:18:25')).toBe(true);
  });

  it('decodes a Twitter snowflake to a plausible date', () => {
    // Plain decoder still picks one variant for direct calls
    const r = snowflakeDecoder.decode('1541815603606036480');
    const ts = r.fields.find((f) => f.label === 'Timestamp');
    // Could be Twitter (2022) or Discord (2026) — both plausible past dates
    expect(ts!.value).toMatch(/^20(2[0-9])-/);
  });

  it('expandSnowflakeVariants returns multiple plausible variants for an ambiguous ID', () => {
    const all = decodeAllSnowflakeVariants('1541815603606036480');
    // This ID plausibly decodes under both Twitter and Discord epochs
    expect(all.length).toBeGreaterThanOrEqual(2);
    const formats = all.map((r) => r.formatId);
    expect(formats).toContain('snowflake-twitter');
    expect(formats).toContain('snowflake-discord');
  });
});
