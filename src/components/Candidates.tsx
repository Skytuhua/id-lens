import { useState } from 'preact/hooks';
import type { DecodeResult } from '../types';
import { FieldRow } from './FieldRow';
import { ByteLayout } from './ByteLayout';

interface Props {
  candidates: DecodeResult[];
}

function CandidateRow({ c }: { c: DecodeResult }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button class="candidate" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span class="candidate__name">{c.format}</span>
        <span class="candidate__summary">{c.summary}</span>
        <span class="candidate__conf">
          {c.confidence} · {open ? '▾' : '▸'}
        </span>
      </button>
      {open ? (
        <div class="candidate__detail">
          {c.layout ? <ByteLayout layout={c.layout} /> : null}
          <div class="fields">
            {c.fields.map((f) => (
              <FieldRow field={f} />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

export function Candidates({ candidates }: Props) {
  if (candidates.length === 0) return null;
  return (
    <div class="candidates">
      <div class="candidates__head">
        <span>OTHER CANDIDATES — {candidates.length}</span>
      </div>
      <div class="candidates__list">
        {candidates.map((c, i) => (
          <CandidateRow key={i} c={c} />
        ))}
      </div>
    </div>
  );
}
