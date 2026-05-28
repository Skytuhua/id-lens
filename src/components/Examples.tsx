import { EXAMPLES } from '../examples';
import { Panel } from './Panel';

interface Props {
  onPick: (value: string) => void;
}

export function Examples({ onPick }: Props) {
  return (
    <Panel
      ix={2}
      title="Examples"
      tight
      right={<span>{EXAMPLES.length} canonical identifiers · click to inspect</span>}
    >
      <div class="examples">
        {EXAMPLES.map((ex) => (
          <button class="example-card" onClick={() => onPick(ex.value)} type="button" key={ex.value}>
            <div class="example-card__head">
              <div class="example-card__name">{ex.format}</div>
              <div class="example-card__hint">INSPECT ↗</div>
            </div>
            <div class="example-card__id">{ex.value}</div>
            {ex.note ? <div class="example-card__desc">{ex.note}</div> : null}
          </button>
        ))}
      </div>
    </Panel>
  );
}
