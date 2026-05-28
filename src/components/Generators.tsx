import { useState, useCallback } from 'preact/hooks';
import { CopyButton } from './CopyButton';
import {
  generateUuidV4,
  generateUuidV7,
  generateUlid,
  generateKsuid,
  generateObjectId,
  generateNanoId,
} from '../generators';

interface Card {
  id: string;
  title: string;
  blurb: string;
  generate: () => string;
}

const CARDS: Card[] = [
  { id: 'uuidv4', title: 'UUID v4', blurb: 'Random, 122 bits of entropy.', generate: generateUuidV4 },
  { id: 'uuidv7', title: 'UUID v7', blurb: 'Time-ordered, Unix-ms timestamp.', generate: generateUuidV7 },
  { id: 'ulid', title: 'ULID', blurb: 'Lexicographically sortable, Crockford base32.', generate: generateUlid },
  { id: 'ksuid', title: 'KSUID', blurb: '32-bit timestamp + 128-bit payload, base62.', generate: generateKsuid },
  { id: 'objectid', title: 'MongoDB ObjectId', blurb: '12-byte hex, timestamp + random + counter.', generate: generateObjectId },
  { id: 'nanoid', title: 'NanoID (21)', blurb: 'URL-safe random, 21 chars.', generate: () => generateNanoId(21) },
];

interface Props {
  onSendToInspector: (v: string) => void;
}

export function Generators({ onSendToInspector }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const c of CARDS) out[c.id] = c.generate();
    return out;
  });

  const regen = useCallback((id: string, fn: () => string) => {
    setValues((v) => ({ ...v, [id]: fn() }));
  }, []);

  return (
    <>
      <div class="hero">
        <h1>Generators</h1>
        <p>Generate a fresh identifier in any of the common formats. Useful for filling test data, debugging, or seeding fixtures.</p>
      </div>
      <div class="gen-grid">
        {CARDS.map((c) => (
          <div class="gen-card">
            <h3>{c.title}</h3>
            <p style={{ margin: 0, color: 'var(--ink-subtle)', fontSize: 12 }}>{c.blurb}</p>
            <div class="gen-out" aria-live="polite">{values[c.id]}</div>
            <div class="gen-row">
              <button class="btn primary" onClick={() => regen(c.id, c.generate)}>Regenerate</button>
              <CopyButton value={values[c.id]} ariaLabel={`Copy ${c.title}`} />
              <button class="btn" onClick={() => onSendToInspector(values[c.id])}>Inspect</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
