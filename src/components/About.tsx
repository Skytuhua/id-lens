import { Panel } from './Panel';

const FORMAT_ROWS: [string, string, string][] = [
  ['UUID v1', '128', 'time + MAC node'],
  ['UUID v3 / v5', '128', 'name-hash (MD5 / SHA-1)'],
  ['UUID v4', '128', 'pure random'],
  ['UUID v6', '128', 'reordered v1'],
  ['UUID v7', '128', 'Unix-ms + random'],
  ['UUID v8', '128', 'vendor-defined'],
  ['Nil / Max UUID', '128', 'sentinels'],
  ['ULID', '128', '48-bit ts + 80-bit rand · base32'],
  ['KSUID', '160', '32-bit ts + 128-bit payload · base62'],
  ['MongoDB ObjectId', '96', '4B ts + 5B random + 3B counter'],
  ['Snowflake (Twitter / X)', '64', 'epoch 2010-11-04'],
  ['Snowflake (Discord)', '64', 'epoch 2015-01-01'],
  ['Snowflake (Instagram)', '64', 'epoch 2011-09-09'],
  ['TSID', '64', 'epoch 2020-01-01 · Crockford base32'],
  ['Xid', '96', '4B ts + 3B machine + 2B pid + 3B counter'],
  ['CUID v1', '~144', 'ts + counter + fingerprint + random'],
  ['CUID v2', '~144', 'opaque by design'],
  ['NanoID', '~126', 'recognition + entropy estimate'],
  ['Stripe-style IDs', '—', 'prefix → object type + live/test'],
  ['Firebase push IDs', '120', '48-bit ts + 72-bit random'],
  ['Sqids / Hashids', '—', 'recognition only'],
  ['Unix timestamp', '32–64', 'sec / ms / µs / ns'],
];

export function About() {
  return (
    <Panel ix={5} title="About">
      <div class="prose">
        <h3>What is this</h3>
        <p>
          <strong>ID Lens</strong> is a privacy-respecting, browser-based universal identifier inspector. Paste any
          identifier and see what it is, what's encoded inside it, and where the spec lives. Every backend engineer
          has stared at a string of characters in a log file and thought <em>"what kind of ID is this?"</em> — ID Lens
          answers that question.
        </p>

        <h3>Privacy</h3>
        <p>
          100% client-side. After the initial download of <code>index.html</code> and assets, the app makes
          <strong> zero</strong> network requests. No telemetry, no analytics, no cookies. The identifier you paste
          never leaves your browser. Only your active tab is persisted locally — not the input itself.
        </p>

        <h3>How detection works</h3>
        <p>
          Every decoder is asked whether the input matches its shape. Matches are ranked by confidence, low-confidence
          noise is suppressed when a strong match exists, and ambiguous inputs — most often numeric strings that could
          be Snowflakes from different vendors — are shown as a candidate list with plausibility scoring (past dates
          beat future dates; among past dates the most recent vendor wins).
        </p>

        <h3>Supported formats</h3>
        <table class="fmt-table">
          <thead>
            <tr>
              <th>Format</th>
              <th style={{ textAlign: 'right' }}>Bits</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {FORMAT_ROWS.map(([n, b, d]) => (
              <tr key={n}>
                <td class="name">{n}</td>
                <td class="bits">{b}</td>
                <td class="dim">{d}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Keyboard</h3>
        <p>
          <kbd>1</kbd>–<kbd>5</kbd> switch tabs · <kbd>/</kbd> focus the input · <kbd>?</kbd> toggle this help ·
          {' '}<kbd>Esc</kbd> blur the input / close help.
        </p>

        <h3>Non-goals</h3>
        <ul>
          <li>No JWT decoding or signature verification — separate problem.</li>
          <li>No hash inversion — impossible by design.</li>
          <li>No server-side lookups — ID Lens does not call out to anything.</li>
          <li>No "guess the language / framework" features.</li>
        </ul>

        <h3>Source</h3>
        <p>
          MIT-licensed. Source at{' '}
          <a href="https://github.com/Skytuhua/id-lens" target="_blank" rel="noopener noreferrer">
            github.com/Skytuhua/id-lens
          </a>
          .
        </p>
      </div>
    </Panel>
  );
}
