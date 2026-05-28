import { useMemo, useCallback } from 'preact/hooks';
import type { RefObject } from 'preact';
import { detectAll } from '../decoders';
import { ResultCard } from './ResultCard';
import { Candidates } from './Candidates';
import { Panel } from './Panel';
import { EXAMPLES } from '../examples';

const ALL_FORMAT_COUNT = 23;

interface Props {
  input: string;
  onInput: (v: string) => void;
  inputRef: RefObject<HTMLInputElement>;
}

const CHIP_PICKS = [
  { tag: 'UUID v4', formatId: 'uuid', match: (f: string) => f === 'UUID v4' },
  { tag: 'UUID v7', formatId: 'uuid', match: (f: string) => f === 'UUID v7' },
  { tag: 'ULID', formatId: 'ulid' },
  { tag: 'ObjectId', formatId: 'objectid' },
  { tag: 'Snowflake', formatId: 'snowflake-discord' },
  { tag: 'Stripe', formatId: 'stripe' },
  { tag: 'Unix', formatId: 'unixtime', match: (f: string) => f === 'Unix seconds' },
];

function pickChip(tag: string, formatId: string, matcher?: (format: string) => boolean) {
  const ex = EXAMPLES.find((e) => (matcher ? matcher(e.format) : e.formatId === formatId));
  if (!ex) return null;
  return { tag, id: ex.value };
}

function EmptyState({ onPick }: { onPick: (v: string) => void }) {
  const chips = CHIP_PICKS.map((p) => pickChip(p.tag, p.formatId, p.match)).filter(
    (x): x is { tag: string; id: string } => x !== null,
  );
  return (
    <div class="empty">
      <div class="empty__title">Awaiting input.</div>
      <div class="empty__hint">
        Paste any identifier above and ID Lens will tell you what it is, what's encoded inside it, and where the spec
        lives. Everything happens in your browser — nothing is sent anywhere.
      </div>
      <div class="empty__chips">
        {chips.map((p) => (
          <button class="empty__chip" onClick={() => onPick(p.id)} key={p.id}>
            <span class="tag">{p.tag}</span>
            {p.id}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Inspector({ input, onInput, inputRef }: Props) {
  const results = useMemo(() => detectAll(input), [input]);
  const trimmed = input.trim();
  const top = results[0];
  const alts = results.slice(1);

  const onPaste = useCallback(async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t) onInput(t.trim());
    } catch {
      /* clipboard unavailable */
    }
  }, [onInput]);

  return (
    <>
      <div class="input-row">
        <span class="prompt" aria-hidden="true">&gt;</span>
        <input
          ref={inputRef}
          spellcheck={false}
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          value={input}
          placeholder="paste any identifier — UUID, ULID, ObjectId, Snowflake, Unix time, Stripe ID…"
          aria-label="Identifier input"
          onInput={(e) => onInput((e.currentTarget as HTMLInputElement).value)}
        />
        <div class="input__actions">
          <button class="input__btn" onClick={onPaste}>PASTE</button>
          <button class="input__btn" onClick={() => onInput('')} disabled={!trimmed}>CLEAR</button>
        </div>
      </div>

      {!trimmed ? (
        <Panel
          ix={1}
          title="Inspector"
          right={
            <span>
              <kbd>/</kbd> focus
            </span>
          }
        >
          <EmptyState onPick={onInput} />
        </Panel>
      ) : !top ? (
        <div class="parse-error">
          <div class="parse-error__rail" aria-hidden="true" />
          <div class="parse-error__body">
            <div class="parse-error__title">UNRECOGNISED</div>
            <div class="parse-error__msg">
              That input doesn't match any of the {ALL_FORMAT_COUNT} formats ID Lens knows. Check About for the full
              list, or try one of the curated examples.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <ResultCard result={top} />
          <Candidates candidates={alts} />
        </div>
      )}
    </>
  );
}
