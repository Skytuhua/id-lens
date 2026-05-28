import { useState, useEffect, useMemo, useCallback, useRef } from 'preact/hooks';
import { Titlebar } from './Titlebar';
import { TabBar, TAB_DEFS, type TabKey } from './TabBar';
import { StatusBar } from './StatusBar';
import { HelpOverlay } from './HelpOverlay';
import { Inspector } from './Inspector';
import { Examples } from './Examples';
import { Batch } from './Batch';
import { Generators } from './Generators';
import { About } from './About';
import { detectAll } from '../decoders';
import { confidenceToFraction } from '../lib/segments';

const TAB_KEY = 'id-lens.tab';

function loadTab(): TabKey {
  try {
    const v = localStorage.getItem(TAB_KEY);
    if (v === 'inspector' || v === 'examples' || v === 'batch' || v === 'generators' || v === 'about') return v;
  } catch {
    /* localStorage unavailable */
  }
  return 'inspector';
}

export function App() {
  const [tab, setTab] = useState<TabKey>(loadTab());
  const [input, setInput] = useState('');
  const [help, setHelp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => detectAll(input), [input]);
  const top = results[0];

  useEffect(() => {
    try {
      localStorage.setItem(TAB_KEY, tab);
    } catch {
      /* localStorage unavailable */
    }
  }, [tab]);

  // Force dark theme attribute (light mode dropped in the redesign).
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const inField =
        active &&
        (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
      if (e.key === 'Escape') {
        setHelp(false);
        if (inField && active instanceof HTMLElement) active.blur();
        return;
      }
      if (inField) return;
      if (e.key === '/') {
        e.preventDefault();
        setTab('inspector');
        setTimeout(() => inputRef.current?.focus(), 0);
        return;
      }
      if (e.key === '?') {
        e.preventDefault();
        setHelp((h) => !h);
        return;
      }
      const idx = ['1', '2', '3', '4', '5'].indexOf(e.key);
      if (idx >= 0) {
        e.preventDefault();
        setTab(TAB_DEFS[idx].key);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const sendToInspector = useCallback((v: string) => {
    setInput(v);
    setTab('inspector');
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const trimmed = input.trim();

  const statusInfo = useMemo(() => {
    const arr: { label?: string; value: string }[] = [];
    if (tab === 'inspector') {
      if (trimmed) arr.push({ label: 'len', value: `${trimmed.length} chars` });
      if (top) {
        arr.push({ label: 'fmt', value: top.format });
        arr.push({ label: 'conf', value: `${Math.round(confidenceToFraction(top.confidence) * 100)}%` });
      } else if (trimmed) {
        arr.push({ label: 'fmt', value: 'unrecognised' });
      } else {
        arr.push({ value: 'awaiting input' });
      }
    } else {
      const def = TAB_DEFS.find((t) => t.key === tab);
      if (def) arr.push({ value: def.label });
    }
    return arr;
  }, [tab, trimmed, top]);

  const modeLabel =
    tab === 'inspector' ? (trimmed ? 'INSPECT' : 'READY') : tab.toUpperCase();

  return (
    <>
      <div class="shell">
        <Titlebar />
        <TabBar active={tab} onChange={setTab} />

        {tab === 'inspector' && (
          <Inspector input={input} onInput={setInput} inputRef={inputRef} />
        )}
        {tab === 'examples' && <Examples onPick={sendToInspector} />}
        {tab === 'batch' && <Batch />}
        {tab === 'generators' && <Generators onSendToInspector={sendToInspector} />}
        {tab === 'about' && <About />}
      </div>
      <StatusBar mode={modeLabel} info={statusInfo} />
      <HelpOverlay open={help} onClose={() => setHelp(false)} />
    </>
  );
}
