import { useState, useCallback } from 'preact/hooks';

interface Props {
  value: string;
  label?: string;
  ariaLabel?: string;
}

export function CopyButton({ value, label = 'COPY', ariaLabel }: Props) {
  const [flash, setFlash] = useState(false);

  const onClick = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        /* clipboard unavailable */
      }
      document.body.removeChild(ta);
    }
    setFlash(true);
    setTimeout(() => setFlash(false), 700);
  }, [value]);

  return (
    <button
      type="button"
      class={`field__copy${flash ? ' flash' : ''}`}
      onClick={onClick}
      aria-label={ariaLabel ?? `Copy ${label}`}
      aria-live="polite"
    >
      {flash ? '✓ COPIED' : label}
    </button>
  );
}
