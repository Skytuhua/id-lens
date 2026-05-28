import type { DecodeResult } from '../types';
import { FieldRow } from './FieldRow';
import { ByteLayout } from './ByteLayout';

interface Props {
  result: DecodeResult;
  alt?: boolean;
}

export function ResultCard({ result, alt }: Props) {
  return (
    <section class={`result-card${alt ? ' alt' : ''}`} aria-label={result.format}>
      <header class="result-header">
        <span class="format-pill">{result.format}</span>
        <span class={`confidence-pill ${result.confidence}`}>{result.confidence} confidence</span>
        <p class="result-summary" style={{ flex: '1 1 100%' }}>{result.summary}</p>
      </header>

      <div class="field-grid">
        {result.fields.map((f) => (
          <FieldRow field={f} />
        ))}
      </div>

      {result.layout ? <ByteLayout layout={result.layout} /> : null}

      {result.warnings && result.warnings.length > 0 ? (
        <div>
          {result.warnings.map((w) => (
            <div class="warning-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style={{ marginTop: 3, flexShrink: 0 }}>
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>{w}</span>
            </div>
          ))}
        </div>
      ) : null}

      {result.reference ? (
        <footer class="result-footer">
          <span>Spec</span>
          <a href={result.reference.url} target="_blank" rel="noopener noreferrer">
            {result.reference.label} ↗
          </a>
        </footer>
      ) : null}
    </section>
  );
}
