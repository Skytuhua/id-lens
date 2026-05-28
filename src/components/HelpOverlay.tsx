import { useEffect } from 'preact/hooks';
import { Fragment } from 'preact';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ROWS: [string, string][] = [
  ['1', 'Inspector'],
  ['2', 'Examples'],
  ['3', 'Batch'],
  ['4', 'Generators'],
  ['5', 'About'],
  ['/', 'Focus the input'],
  ['Esc', 'Close help · blur input'],
  ['?', 'This help'],
];

export function HelpOverlay({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div class="help-overlay" onClick={onClose} role="dialog" aria-label="Key bindings">
      <div class="help-modal" onClick={(e) => e.stopPropagation()}>
        <div class="panel__head">
          <span class="ix">00</span>
          <span class="title">KEY BINDINGS</span>
          <span class="panel__head__right">
            <button class="gen__btn" onClick={onClose}>esc · close</button>
          </span>
        </div>
        <div class="help-rows">
          {ROWS.map(([k, label]) => (
            <Fragment key={k}>
              <kbd>{k}</kbd>
              <span class="key-label">{label}</span>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
