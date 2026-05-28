import type { DecodeResult } from '../types';
import { FieldRow } from './FieldRow';
import { ByteLayout } from './ByteLayout';
import { ConfBar } from './ConfBar';

interface Props {
  result: DecodeResult;
}

export function ResultCard({ result }: Props) {
  return (
    <section class="decode" aria-label={result.format}>
      <header class="decode__head">
        <div class="decode__name">{result.format}</div>
        <div class="decode__summary">
          <strong>{result.summary}</strong>
        </div>
        <ConfBar confidence={result.confidence} />
      </header>

      <div class="decode__body">
        {result.layout ? <ByteLayout layout={result.layout} /> : null}

        <div class="fields">
          {result.fields.map((f) => (
            <FieldRow field={f} />
          ))}
        </div>

        {result.warnings && result.warnings.length > 0 ? (
          <div class="warnings">
            {result.warnings.map((w) => (
              <div class="warning-row">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                  style={{ marginTop: 3, flexShrink: 0 }}
                >
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
          <div class="decode__foot">
            <span>format ref</span>
            <a class="spec-link" href={result.reference.url} target="_blank" rel="noopener noreferrer">
              {result.reference.label} ↗
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
