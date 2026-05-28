import { useState, useCallback } from 'preact/hooks';
import { Panel } from './Panel';
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
  generate: () => string;
}

const CARDS: Card[] = [
  { id: 'uuidv4', title: 'UUID v4', generate: generateUuidV4 },
  { id: 'uuidv7', title: 'UUID v7', generate: generateUuidV7 },
  { id: 'ulid', title: 'ULID', generate: generateUlid },
  { id: 'objectid', title: 'MongoDB ObjectId', generate: generateObjectId },
  { id: 'ksuid', title: 'KSUID', generate: generateKsuid },
  { id: 'nanoid', title: 'NanoID (21)', generate: () => generateNanoId(21) },
];

interface Props {
  onSendToInspector: (v: string) => void;
}

function GenCell({
  card,
  value,
  onRefresh,
  onInspect,
}: {
  card: Card;
  value: string;
  onRefresh: () => void;
  onInspect: () => void;
}) {
  const [flash, setFlash] = useState(false);
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* unavailable */
    }
    setFlash(true);
    setTimeout(() => setFlash(false), 700);
  }, [value]);
  return (
    <div class="gen">
      <div class="gen__head">
        <div class="gen__name">{card.title}</div>
        <div class="gen__actions">
          <button class="gen__btn" onClick={onRefresh}>↻ new</button>
          <button class={`gen__btn${flash ? ' flash' : ''}`} onClick={copy}>
            {flash ? '✓ copied' : 'copy'}
          </button>
          <button class="gen__btn" onClick={onInspect}>inspect</button>
        </div>
      </div>
      <div class="gen__out" aria-live="polite">{value}</div>
    </div>
  );
}

export function Generators({ onSendToInspector }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const c of CARDS) out[c.id] = c.generate();
    return out;
  });

  return (
    <Panel ix={4} title="Generators" tight right={<span>fresh IDs · cryptographically random</span>}>
      <div class="gens">
        {CARDS.map((c) => (
          <GenCell
            key={c.id}
            card={c}
            value={values[c.id]}
            onRefresh={() => setValues((v) => ({ ...v, [c.id]: c.generate() }))}
            onInspect={() => onSendToInspector(values[c.id])}
          />
        ))}
      </div>
    </Panel>
  );
}
