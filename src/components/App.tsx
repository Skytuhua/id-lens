import { useState, useEffect, useCallback } from 'preact/hooks';
import { Inspector } from './Inspector';
import { Examples } from './Examples';
import { Batch } from './Batch';
import { Generators } from './Generators';
import { About } from './About';
import { ThemeToggle } from './ThemeToggle';

type Tab = 'inspector' | 'examples' | 'batch' | 'generators' | 'about';

const TABS: { id: Tab; label: string }[] = [
  { id: 'inspector', label: 'Inspector' },
  { id: 'examples', label: 'Examples' },
  { id: 'batch', label: 'Batch' },
  { id: 'generators', label: 'Generators' },
  { id: 'about', label: 'About' },
];

const THEME_KEY = 'id-lens.theme';
const TAB_KEY = 'id-lens.tab';

function loadTheme(): 'dark' | 'light' {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    /* localStorage unavailable */
  }
  return 'dark';
}

function loadTab(): Tab {
  try {
    const v = localStorage.getItem(TAB_KEY);
    if (v === 'inspector' || v === 'examples' || v === 'batch' || v === 'generators' || v === 'about') return v;
  } catch {
    /* localStorage unavailable */
  }
  return 'inspector';
}

export function App() {
  const [tab, setTab] = useState<Tab>(loadTab());
  const [input, setInput] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>(loadTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
    /* localStorage unavailable */
  }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(TAB_KEY, tab);
    } catch {
    /* localStorage unavailable */
  }
  }, [tab]);

  const onSendToInspector = useCallback((v: string) => {
    setInput(v);
    setTab('inspector');
  }, []);

  return (
    <>
      <header class="app-header">
        <div class="app-header-inner">
          <a href="#" class="brand" onClick={(e) => { e.preventDefault(); setTab('inspector'); }}>
            <svg class="brand-lens" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="13" cy="13" r="8" stroke="var(--accent)"></circle>
              <line x1="19" y1="19" x2="27" y2="27" stroke="var(--accent)"></line>
            </svg>
            <span><span class="brand-id">ID</span> <span class="brand-suffix">Lens</span></span>
          </a>
          <div class="header-spacer" />
          <ThemeToggle theme={theme} onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
          <a href="https://github.com/Skytuhua/id-lens" target="_blank" rel="noopener noreferrer" class="icon-btn" aria-label="View on GitHub">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.34-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.68 1.25 3.34.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.14 1.18a10.92 10.92 0 0 1 5.72 0c2.18-1.49 3.14-1.18 3.14-1.18.62 1.59.23 2.77.11 3.06.73.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.39-5.26 5.68.41.35.78 1.05.78 2.11v3.13c0 .31.21.66.79.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
            </svg>
          </a>
        </div>
      </header>

      <main class="page">
        <nav class="tabs" role="tablist" aria-label="Sections">
          {TABS.map((t) => (
            <button
              role="tab"
              class="tab"
              aria-selected={tab === t.id}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'inspector' ? (
          <Inspector input={input} onInput={setInput} onClear={() => setInput('')} />
        ) : tab === 'examples' ? (
          <Examples onPick={onSendToInspector} />
        ) : tab === 'batch' ? (
          <Batch />
        ) : tab === 'generators' ? (
          <Generators onSendToInspector={onSendToInspector} />
        ) : (
          <About />
        )}
      </main>

      <footer class="app-footer">
        <div class="app-footer-inner">
          <span>ID Lens · client-side identifier inspector · MIT</span>
          <span>
            <a href="https://github.com/Skytuhua/id-lens" target="_blank" rel="noopener noreferrer">Source</a>
            {' · '}
            <a href="https://github.com/Skytuhua/id-lens/releases" target="_blank" rel="noopener noreferrer">Releases</a>
          </span>
        </div>
      </footer>
    </>
  );
}
