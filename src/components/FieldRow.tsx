import { CopyButton } from './CopyButton';
import type { DecodedField } from '../types';

interface Props {
  field: DecodedField;
}

export function FieldRow({ field }: Props) {
  return (
    <div class="field-row">
      <div class="field-label">{field.label}</div>
      <div class={`field-value${field.mono ? ' mono' : ''}`} data-segment={field.segment ?? ''}>
        <span class="field-value-text">{field.value}</span>
        {field.hint ? <span class="hint">{field.hint}</span> : null}
      </div>
      {field.value && field.value !== '—' ? (
        <CopyButton value={field.value} ariaLabel={`Copy ${field.label}`} />
      ) : (
        <span />
      )}
    </div>
  );
}
