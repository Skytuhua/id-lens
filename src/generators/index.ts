import { bytesToHex } from '../lib/bytes';
import { encodeCrockford } from '../lib/base32';
import { encodeBase62 } from '../lib/base62';

function randomBytes(n: number): number[] {
  const arr = new Uint8Array(n);
  crypto.getRandomValues(arr);
  return Array.from(arr);
}

function formatUuid(bytes: number[]): string {
  const h = bytesToHex(bytes);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function generateUuidV4(): string {
  const b = randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40; // version 4
  b[8] = (b[8] & 0x3f) | 0x80; // variant 10
  return formatUuid(b);
}

export function generateUuidV7(): string {
  const ms = BigInt(Date.now());
  const b: number[] = new Array(16);
  // 48-bit ms timestamp big-endian
  b[0] = Number((ms >> 40n) & 0xffn);
  b[1] = Number((ms >> 32n) & 0xffn);
  b[2] = Number((ms >> 24n) & 0xffn);
  b[3] = Number((ms >> 16n) & 0xffn);
  b[4] = Number((ms >> 8n) & 0xffn);
  b[5] = Number(ms & 0xffn);
  // 10 random bytes
  const rest = randomBytes(10);
  for (let i = 0; i < 10; i++) b[6 + i] = rest[i];
  // Set version 7
  b[6] = (b[6] & 0x0f) | 0x70;
  // Set variant 10
  b[8] = (b[8] & 0x3f) | 0x80;
  return formatUuid(b);
}

export function generateUlid(): string {
  const ms = BigInt(Date.now());
  const random = randomBytes(10);
  let rand = 0n;
  for (const x of random) rand = (rand << 8n) | BigInt(x);
  const value = (ms << 80n) | rand;
  return encodeCrockford(value, 26);
}

export function generateKsuid(): string {
  const KSUID_EPOCH_SEC = 1400000000;
  const ts = Math.floor(Date.now() / 1000) - KSUID_EPOCH_SEC;
  const bytes: number[] = new Array(20);
  bytes[0] = (ts >> 24) & 0xff;
  bytes[1] = (ts >> 16) & 0xff;
  bytes[2] = (ts >> 8) & 0xff;
  bytes[3] = ts & 0xff;
  const payload = randomBytes(16);
  for (let i = 0; i < 16; i++) bytes[4 + i] = payload[i];
  let value = 0n;
  for (const b of bytes) value = (value << 8n) | BigInt(b);
  return encodeBase62(value, 27);
}

export function generateObjectId(): string {
  const ts = Math.floor(Date.now() / 1000);
  const rest = randomBytes(8);
  const bytes: number[] = new Array(12);
  bytes[0] = (ts >> 24) & 0xff;
  bytes[1] = (ts >> 16) & 0xff;
  bytes[2] = (ts >> 8) & 0xff;
  bytes[3] = ts & 0xff;
  for (let i = 0; i < 8; i++) bytes[4 + i] = rest[i];
  return bytesToHex(bytes);
}

const NANOID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';

export function generateNanoId(length = 21): string {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += NANOID_ALPHABET[bytes[i] & 63];
  }
  return out;
}
