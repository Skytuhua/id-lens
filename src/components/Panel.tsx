import type { ComponentChildren } from 'preact';

interface Props {
  ix?: number;
  title: string;
  right?: ComponentChildren;
  tight?: boolean;
  children: ComponentChildren;
}

export function Panel({ ix, title, right, tight, children }: Props) {
  return (
    <section class="panel">
      <div class="panel__head">
        {ix != null ? <span class="ix">{String(ix).padStart(2, '0')}</span> : null}
        <span class="title">{title}</span>
        {right ? <span class="panel__head__right">{right}</span> : null}
      </div>
      <div class={tight ? 'panel__body panel__body--tight' : 'panel__body'}>{children}</div>
    </section>
  );
}
