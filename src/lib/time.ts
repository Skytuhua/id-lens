export function unixMsToIso(ms: number | bigint): string {
  const n = typeof ms === 'bigint' ? Number(ms) : ms;
  if (!Number.isFinite(n)) return 'invalid';
  const d = new Date(n);
  if (isNaN(d.getTime())) return 'invalid';
  return d.toISOString();
}

export function unixSecToIso(sec: number | bigint): string {
  const n = typeof sec === 'bigint' ? Number(sec) : sec;
  return unixMsToIso(n * 1000);
}

// UUID v1 / v6 timestamp: 100-nanosecond intervals since 1582-10-15 00:00:00 UTC (Gregorian reform).
// JS Date origin (1970-01-01) sits 122192928000000000 hundreds-of-ns later.
const GREGORIAN_TO_UNIX_OFFSET_100NS = 122192928000000000n;

export function uuidV1TimestampToIso(t: bigint): string {
  const unixMs = (t - GREGORIAN_TO_UNIX_OFFSET_100NS) / 10000n;
  return unixMsToIso(unixMs);
}

export function ago(ms: number): string {
  const diff = Date.now() - ms;
  if (!Number.isFinite(diff)) return '';
  const abs = Math.abs(diff);
  const future = diff < 0;
  const sec = Math.floor(abs / 1000);
  if (sec < 60) return future ? `in ${sec}s` : `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return future ? `in ${min}m` : `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 48) return future ? `in ${hr}h` : `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 60) return future ? `in ${day}d` : `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 24) return future ? `in ${mo}mo` : `${mo}mo ago`;
  const yr = Math.floor(day / 365);
  return future ? `in ${yr}y` : `${yr}y ago`;
}
