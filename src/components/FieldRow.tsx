import { CopyButton } from './CopyButton';
import { segName } from '../lib/segments';
import type { DecodedField } from '../types';

interface Props {
  field: DecodedField;
}

export function FieldRow({ field }: Props) {
  const sn = segName(field.segment);
  const copyable = field.value && field.value !== '—';
  return (
    <div class="field">
      <div class="field__label" data-seg={sn ?? undefined}>
        <span class="marker" aria-hidden="true" />
        {field.label}
      </div>
      <div class="field__value">
        <span>{field.value}</span>
        {field.hint ? <span class="note">— {field.hint}</span> : null}
      </div>
      {copyable ? <CopyButton value={field.value} ariaLabel={`Copy ${field.label}`} /> : <span />}
    </div>
  );
}
