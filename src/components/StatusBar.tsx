interface StatusInfo {
  label?: string;
  value: string;
}

interface Props {
  mode: string;
  info: StatusInfo[];
}

export function StatusBar({ mode, info }: Props) {
  return (
    <div class="statusbar" role="status" aria-live="polite">
      <div class="statusbar__seg mode">
        <span class="label">MODE</span>
        <span class="val">{mode}</span>
      </div>
      {info.map((it, i) => (
        <div class="statusbar__seg" key={i}>
          {it.label ? <span class="label">{it.label}</span> : null}
          <span class="val">{it.value}</span>
        </div>
      ))}
      <div class="statusbar__seg">
        <span class="label">privacy</span>
        <span class="val">100% client-side · 0 network</span>
      </div>
    </div>
  );
}
