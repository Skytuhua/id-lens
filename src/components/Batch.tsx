import { useState, useMemo } from 'preact/hooks';
import { detectAll } from '../decoders';
import { Panel } from './Panel';
import { confidenceToFraction } from '../lib/segments';

const SAMPLE =
  '6ba7b810-9dad-11d1-80b4-00c04fd430c8\n' +
  '01ARZ3NDEKTSV4RRFFQ69G5FAV\n' +
  '507f1f77bcf86cd799439011\n' +
  '175928847299117063\n' +
  'cus_NeZwdNtLEOXuvB\n' +
  '1700000000\n' +
  '9m4e2mr0ui3e8a215n4g';

export function Batch() {
  const [text, setText] = useState(SAMPLE);

  const rows = useMemo(() => {
    const lines = text
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    return lines.map((line) => {
      const results = detectAll(line);
      const top = results[0];
      let keyField = '';
      if (top) {
        const candidate =
          top.fields.find((f) => f.label === 'Timestamp') ??
          top.fields.find((f) => f.label === 'Version') ??
          top.fields.find((f) => f.label === 'Object type');
        keyField = candidate ? candidate.value : top.summary;
      }
      return {
        input: line,
        format: top?.format,
        confidence: top?.confidence,
        keyField,
      };
    });
  }, [text]);

  return (
    <Panel
      ix={3}
      title="Batch"
      right={<span>{rows.length} identifier{rows.length === 1 ? '' : 's'} · paste one per line</span>}
    >
      <div class="batch">
        <div>
          <textarea
            value={text}
            placeholder="paste one identifier per line…"
            onInput={(e) => setText((e.currentTarget as HTMLTextAreaElement).value)}
            spellcheck={false}
          />
          <div class="batch__actions">
            <button class="gen__btn" onClick={() => setText(SAMPLE)}>load sample</button>
            <button class="gen__btn" onClick={() => setText('')} disabled={!text}>clear</button>
          </div>
        </div>
        <div class="batch__results">
          <table class="batch-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Input</th>
                <th>Format</th>
                <th>Key field</th>
                <th>Conf</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td class="dim" colSpan={5} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ink-dim)' }}>
                    paste identifiers on the left
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={i}>
                    <td class="dim">{String(i + 1).padStart(2, '0')}</td>
                    <td class="id">{r.input}</td>
                    <td class="fmt">{r.format ?? <span style={{ color: 'var(--err)' }}>—</span>}</td>
                    <td class="key">{r.format ? r.keyField : <span class="dim">unrecognised</span>}</td>
                    <td class="dim">
                      {r.confidence
                        ? `${Math.round(confidenceToFraction(r.confidence) * 100)}%`
                        : ''}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  );
}
