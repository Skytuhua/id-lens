const FORMATS: { name: string; ref: string }[] = [
  { name: 'UUID v1 (time + MAC)', ref: 'https://www.rfc-editor.org/rfc/rfc9562' },
  { name: 'UUID v3 (MD5 name-based)', ref: 'https://www.rfc-editor.org/rfc/rfc9562' },
  { name: 'UUID v4 (random)', ref: 'https://www.rfc-editor.org/rfc/rfc9562' },
  { name: 'UUID v5 (SHA-1 name-based)', ref: 'https://www.rfc-editor.org/rfc/rfc9562' },
  { name: 'UUID v6 (reordered v1)', ref: 'https://www.rfc-editor.org/rfc/rfc9562' },
  { name: 'UUID v7 (Unix-ms ordered)', ref: 'https://www.rfc-editor.org/rfc/rfc9562' },
  { name: 'UUID v8 (vendor-defined)', ref: 'https://www.rfc-editor.org/rfc/rfc9562' },
  { name: 'Nil & Max UUIDs', ref: 'https://www.rfc-editor.org/rfc/rfc9562' },
  { name: 'ULID', ref: 'https://github.com/ulid/spec' },
  { name: 'KSUID', ref: 'https://github.com/segmentio/ksuid' },
  { name: 'MongoDB ObjectId', ref: 'https://www.mongodb.com/docs/manual/reference/method/ObjectId/' },
  { name: 'Snowflake (Twitter / X)', ref: 'https://github.com/twitter-archive/snowflake/tree/snowflake-2010' },
  { name: 'Snowflake (Discord)', ref: 'https://discord.com/developers/docs/reference#snowflakes' },
  { name: 'Snowflake (Instagram)', ref: 'https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c' },
  { name: 'NanoID', ref: 'https://github.com/ai/nanoid' },
  { name: 'TSID', ref: 'https://github.com/f4b6a3/tsid-creator' },
  { name: 'Xid', ref: 'https://github.com/rs/xid' },
  { name: 'CUID v1', ref: 'https://github.com/paralleldrive/cuid' },
  { name: 'CUID v2', ref: 'https://github.com/paralleldrive/cuid2' },
  { name: 'Stripe-style IDs', ref: 'https://stripe.com/docs/api' },
  { name: 'Firebase push IDs', ref: 'https://firebase.blog/posts/2015/02/the-2120-ways-to-ensure-unique-identifiers/' },
  { name: 'Sqids / Hashids', ref: 'https://sqids.org/' },
  { name: 'Unix timestamps (s/ms/µs/ns)', ref: 'https://en.wikipedia.org/wiki/Unix_time' },
];

export function About() {
  return (
    <div class="about">
      <div class="hero">
        <h1>About ID Lens</h1>
        <p>
          ID Lens is a privacy-respecting universal identifier inspector. Paste any ID and see what it is, what's inside it, and where the spec lives.
          Everything runs in your browser — there's no backend, no telemetry, no analytics.
        </p>
      </div>

      <section class="about-block">
        <h2>Privacy</h2>
        <p>
          ID Lens is a static single-page app. After the initial download of HTML, JS, and CSS, the page makes <strong>no network requests</strong>.
          The identifier you paste never leaves your device. There's no logging, no analytics, no cookies — not even local storage for the input.
          The only thing persisted locally is your theme preference (dark / light).
        </p>
      </section>

      <section class="about-block">
        <h2>How detection works</h2>
        <p>
          Each format has its own decoder with a <code>matches(input)</code> probe that returns a confidence level (<em>high</em>, <em>medium</em>, or <em>low</em>) or no match.
          Probes use length, alphabet, structural patterns, and plausibility checks (e.g. "does this snowflake decode to a date within 50 years of now?").
          When multiple formats plausibly match, ID Lens shows all candidates ranked by confidence.
        </p>
        <p>
          Some inputs are inherently ambiguous — a 21-character URL-safe string could be a NanoID or a Firebase push ID; a numeric string could be a Twitter or Discord snowflake.
          ID Lens shows all plausible interpretations rather than guessing.
        </p>
      </section>

      <section class="about-block">
        <h2>Supported formats</h2>
        <ul class="format-list">
          {FORMATS.map((f) => (
            <li><a href={f.ref} target="_blank" rel="noopener noreferrer">{f.name}</a></li>
          ))}
        </ul>
      </section>

      <section class="about-block">
        <h2>Non-goals</h2>
        <ul>
          <li>No JWT decoding or signature verification — separate concern.</li>
          <li>No hash inversion — impossible by design.</li>
          <li>No server-side lookups or external API calls.</li>
          <li>No support for encrypted / signed tokens whose payload isn't directly readable.</li>
        </ul>
      </section>

      <section class="about-block">
        <h2>Source</h2>
        <p>
          ID Lens is open-source under the MIT license.
          {' '}
          <a href="https://github.com/Skytuhua/id-lens" target="_blank" rel="noopener noreferrer">View on GitHub ↗</a>
        </p>
      </section>
    </div>
  );
}
