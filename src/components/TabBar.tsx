export type TabKey = 'inspector' | 'examples' | 'batch' | 'generators' | 'about';

export const TAB_DEFS: { key: TabKey; num: string; label: string }[] = [
  { key: 'inspector', num: '1', label: 'inspector' },
  { key: 'examples', num: '2', label: 'examples' },
  { key: 'batch', num: '3', label: 'batch' },
  { key: 'generators', num: '4', label: 'generators' },
  { key: 'about', num: '5', label: 'about' },
];

interface Props {
  active: TabKey;
  onChange: (k: TabKey) => void;
}

export function TabBar({ active, onChange }: Props) {
  return (
    <nav class="tabs" role="tablist" aria-label="ID Lens sections">
      {TAB_DEFS.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={active === t.key}
          tabIndex={active === t.key ? 0 : -1}
          class="tab"
          onClick={() => onChange(t.key)}
        >
          <span class="num">{t.num}</span>
          {t.label}
        </button>
      ))}
      <span class="tabs__spacer" />
      <span class="tabs__hint">
        <kbd>1</kbd>–<kbd>5</kbd> switch · <kbd>/</kbd> focus · <kbd>?</kbd> help
      </span>
    </nav>
  );
}
