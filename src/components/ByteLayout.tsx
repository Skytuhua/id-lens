import type { ByteLayout as BL } from '../types';

interface Props {
  layout: BL;
}

export function ByteLayout({ layout }: Props) {
  // Build per-byte color map
  const colorForByte: number[] = new Array(layout.bytes.length).fill(0);
  for (const seg of layout.segments) {
    for (let i = seg.start; i < seg.end && i < layout.bytes.length; i++) {
      colorForByte[i] = seg.color;
    }
  }
  return (
    <div class="bytes-block">
      <div class="bytes-strip" role="presentation">
        {layout.bytes.map((b, i) => (
          <div class="byte-cell" data-color={String(colorForByte[i])} title={`Byte ${i}: 0x${b.toString(16).padStart(2, '0')}`}>
            {b.toString(16).padStart(2, '0')}
          </div>
        ))}
      </div>
      <div class="bytes-legend">
        {layout.segments.map((s) => (
          <span class="legend-item">
            <span class="legend-swatch" data-color={String(s.color)} aria-hidden="true"></span>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
