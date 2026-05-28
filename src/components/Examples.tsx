import { EXAMPLES } from '../examples';

interface Props {
  onPick: (value: string) => void;
}

export function Examples({ onPick }: Props) {
  return (
    <>
      <div class="hero">
        <h1>Examples library</h1>
        <p>One click loads any example into the Inspector. Use these to explore what each format looks like and what fields it contains.</p>
      </div>
      <div class="examples-grid">
        {EXAMPLES.map((ex) => (
          <button class="example-card" onClick={() => onPick(ex.value)} type="button">
            <span class="name">{ex.format}</span>
            <span class="value" title={ex.value}>{ex.value}</span>
            {ex.note ? <span class="note">{ex.note}</span> : null}
          </button>
        ))}
      </div>
    </>
  );
}
