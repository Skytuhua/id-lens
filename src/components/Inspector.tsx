import { useMemo } from 'preact/hooks';
import { detectAll } from '../decoders';
import { ResultCard } from './ResultCard';
import { EXAMPLES } from '../examples';

interface Props {
  input: string;
  onInput: (v: string) => void;
  onClear: () => void;
}

export function Inspector({ input, onInput, onClear }: Props) {
  const results = useMemo(() => detectAll(input), [input]);
  const trimmed = input.trim();

  // Pick 4 example chips covering varied formats
  const sampleChips = useMemo(
    () => [
      EXAMPLES.find((e) => e.formatId === 'uuid' && e.format.includes('v7'))!,
      EXAMPLES.find((e) => e.formatId === 'ulid')!,
      EXAMPLES.find((e) => e.formatId === 'snowflake-discord')!,
      EXAMPLES.find((e) => e.formatId === 'stripe')!,
    ],
    [],
  );

  return (
    <>
      <div class="hero">
        <h1>Paste any identifier. See what it is.</h1>
        <p>
          ID Lens auto-detects and decodes UUIDs (v1–v8), ULIDs, KSUIDs, Snowflakes from Twitter/Discord/Instagram,
          MongoDB ObjectIds, Stripe IDs, Firebase push IDs, TSIDs, Xids, CUIDs, Sqids, and Unix timestamps —
          entirely in your browser. Nothing is sent anywhere.
        </p>
      </div>

      <div class="input-card">
        <label class="input-label" for="id-input">Identifier</label>
        <div class="input-row">
          <input
            id="id-input"
            class="id-input"
            type="text"
            spellcheck={false}
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
            placeholder="Paste any identifier…"
            value={input}
            onInput={(e) => onInput((e.currentTarget as HTMLInputElement).value)}
          />
          {trimmed ? (
            <button class="input-clear" onClick={onClear} aria-label="Clear input">Clear</button>
          ) : null}
        </div>
        {!trimmed ? (
          <div class="try-chips">
            <span>Try:</span>
            {sampleChips.map((c) => (
              <button class="chip" onClick={() => onInput(c.value)}>{c.format}</button>
            ))}
          </div>
        ) : null}
      </div>

      <div class="results" aria-live="polite">
        {!trimmed ? (
          <div class="empty-state">
            Paste an identifier above to inspect it. Everything happens locally — no data leaves your browser.
          </div>
        ) : results.length === 0 ? (
          <div class="no-match">
            <strong>No format matched.</strong>
            That doesn't look like any identifier ID Lens recognises. Check the About tab for the full list of supported formats.
          </div>
        ) : (
          results.map((r, i) => <ResultCard result={r} alt={i > 0} />)
        )}
      </div>
    </>
  );
}
