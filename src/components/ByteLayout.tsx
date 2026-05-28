import type { ByteLayout as BL } from '../types';
import { segName, type SegName } from '../lib/segments';

interface Props {
  layout: BL;
}

interface Group {
  seg: SegName;
  start: number;
  end: number; // inclusive
}

function buildGroups(bytes: number[], colorForByte: (number | undefined)[]): Group[] {
  const groups: Group[] = [];
  for (let i = 0; i < bytes.length; i++) {
    const seg = segName(colorForByte[i]);
    if (!seg) continue;
    const last = groups[groups.length - 1];
    if (last && last.seg === seg && last.end === i - 1) {
      last.end = i;
    } else {
      groups.push({ seg, start: i, end: i });
    }
  }
  return groups;
}

export function ByteLayout({ layout }: Props) {
  const colorForByte: (number | undefined)[] = new Array(layout.bytes.length).fill(undefined);
  for (const seg of layout.segments) {
    for (let i = seg.start; i < seg.end && i < layout.bytes.length; i++) {
      colorForByte[i] = seg.color;
    }
  }
  const groups = buildGroups(layout.bytes, colorForByte);

  return (
    <div class="hex">
      <div class="hex__row">
        <span class="hex__addr">0000</span>
        <span class="hex__bytes">
          {layout.bytes.map((b, i) => {
            const sn = segName(colorForByte[i]);
            return (
              <span
                class="hex__byte"
                data-seg={sn ?? undefined}
                title={`Byte ${i}: 0x${b.toString(16).padStart(2, '0')}`}
                key={i}
              >
                {b.toString(16).padStart(2, '0')}
              </span>
            );
          })}
        </span>
      </div>
      <div class="hex__row" style={{ marginTop: 2 }}>
        <span class="hex__addr" aria-hidden="true" style={{ visibility: 'hidden' }}>0000</span>
        <span class="hex__bytes">
          {layout.bytes.map((_b, i) => {
            const grp = groups.find((g) => g.start <= i && g.end >= i);
            if (!grp) {
              return (
                <span class="hex__byte hex__byte--leader hex__byte--leader-empty" key={i} aria-hidden="true">··</span>
              );
            }
            let ch: string;
            if (grp.start === grp.end) ch = '┃';
            else if (i === grp.start) ch = '╰─';
            else if (i === grp.end) ch = '─╯';
            else ch = '──';
            return (
              <span
                class="hex__byte hex__byte--leader"
                data-seg={grp.seg}
                key={i}
                aria-hidden="true"
              >
                {ch}
              </span>
            );
          })}
        </span>
      </div>
      <div class="hex__legend">
        {layout.segments.map((s, i) => {
          const sn = segName(s.color);
          const widthBytes = s.end - s.start;
          return (
            <div class="hex__legend__item" data-seg={sn ?? undefined} key={i}>
              <span class="swatch" aria-hidden="true" />
              {s.label} <span class="bits">{widthBytes * 8}b</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
