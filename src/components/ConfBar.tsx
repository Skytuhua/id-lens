import type { Confidence } from '../types';
import { confidenceToFraction } from '../lib/segments';

interface Props {
  confidence: Confidence;
}

export function ConfBar({ confidence }: Props) {
  const frac = confidenceToFraction(confidence);
  const on = Math.max(1, Math.round(frac * 5));
  const klass = frac >= 0.8 ? '' : frac >= 0.5 ? 'conf--mid' : 'conf--low';
  return (
    <div class={`decode__conf ${klass}`} aria-label={`Confidence ${confidence}`}>
      <span>conf</span>
      <span class="bar" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} class={i < on ? 'on' : ''} />
        ))}
      </span>
      <span>{confidence}</span>
    </div>
  );
}
