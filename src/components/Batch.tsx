import { useState, useMemo } from 'preact/hooks';
import { detectAll } from '../decoders';

const SAMPLE = `6ba7b810-9dad-11d1-80b4-00c04fd430c8
01ARZ3NDEKTSV4RRFFQ69G5FAV
507f1f77bcf86cd799439011
1700000000
cus_NeZwdNtLEOXuvB
9m4e2mr0ui3e8a215n4g
175928847299117063`;

export function Batch() {
  const [text, setText] = useState('');

  const rows = useMemo(() => {
    const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    return lines.map((line) => {
      const results = detectAll(line);
      const top = results[0];
      let keyField = '';
      if (top) {
        const candidate = top.fields.find((f) => f.label === 'Timestamp')
          ?? top.fields.find((f) => f.label === 'Version')
          ?? top.fields.find((f) => f.label === 'Object type');
        keyField = candidate ? candidate.value : '';
      }
      return { input: line, format: top?.format ?? 'unknown', formatId: top?.formatId ?? 'unknown', confidence: top?.confidence ?? 'low', keyField };
    });
  }, [text]);

  return (
    <>
      <div class="hero">
        <h1>Batch decode</h1>
        <p>Paste one identifier per line. The table updates live with the detected format and a key field for each.</p>
      </div>

      <div class="batch-grid">
        <div class="input-card">
          <label class="input-label" for="batch-input">Identifiers (one per line)</label>
          <textarea
            id="batch-input"
            class="batch-input"
            spellcheck={false}
            value={text}
            placeholder={SAMPLE}
            onInput={(e) => setText((e.currentTarget as HTMLTextAreaElement).value)}
          />
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button class="btn" onClick={() => setText(SAMPLE)}>Load sample</button>
            <button class="btn" onClick={() => setText('')} disabled={!text}>Clear</button>
          </div>
        </div>

        {rows.length === 0 ? (
          <div class="empty-state">Add identifiers above to see them analysed in a table.</div>
        ) : (
          <div style={{ overflowX: 'auto', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-md)' }}>
            <table class="batch-table">
              <thead>
                <tr>
                  <th>Input</th>
                  <th>Format</th>
                  <th>Key field</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr>
                    <td class="mono" title={r.input}><span class="truncate">{r.input}</span></td>
                    <td>{r.format === 'unknown' ? <span style={{ color: 'var(--ink-faint)' }}>—</span> : r.format}</td>
                    <td class="mono"><span class="truncate" title={r.keyField}>{r.keyField || '—'}</span></td>
                    <td>{r.format === 'unknown' ? <span style={{ color: 'var(--ink-faint)' }}>—</span> : <span class={`confidence-pill ${r.confidence}`}>{r.confidence}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
