import { useState, useEffect } from 'preact/hooks';

export function Titlebar() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const utc = now.toISOString().slice(11, 19);
  return (
    <header class="titlebar">
      <div class="titlebar__brand">
        <span class="bracket">[</span>
        <span>ID</span>
        <span class="glyph">·</span>
        <span>LENS</span>
        <span class="bracket">]</span>
        <span class="ver">v2.0.0</span>
      </div>
      <div class="titlebar__center">UNIVERSAL IDENTIFIER INSPECTOR</div>
      <div class="titlebar__meta">
        <span class="dot" aria-hidden="true" />
        {utc} UTC
      </div>
    </header>
  );
}
