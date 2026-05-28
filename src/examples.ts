export interface Example {
  format: string;       // human label
  formatId: string;     // matches Decoder.id
  value: string;
  note?: string;
}

export const EXAMPLES: Example[] = [
  { format: 'UUID v1', formatId: 'uuid', value: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', note: 'RFC namespace UUID for DNS' },
  { format: 'UUID v3', formatId: 'uuid', value: '3d813cbb-47fb-32ba-91df-831e1593ac29', note: 'MD5 name-based UUID' },
  { format: 'UUID v4', formatId: 'uuid', value: '4f6f9a3c-1c5e-4a2c-8d2a-1e6b1b0a2c3d', note: 'Random' },
  { format: 'UUID v5', formatId: 'uuid', value: '21f7f8de-8051-5b89-8680-0195ef798b6a', note: 'SHA-1 name-based' },
  { format: 'UUID v6', formatId: 'uuid', value: '1ef2a3d5-5e91-6b1c-bb47-9c2a1f3e4d5a', note: 'Time-sortable v1 reorder' },
  { format: 'UUID v7', formatId: 'uuid', value: '018f4d2e-7c33-7c4e-bff9-2c1f9a3a4b5c', note: 'Unix-ms ordered' },
  { format: 'Nil UUID', formatId: 'uuid', value: '00000000-0000-0000-0000-000000000000' },
  { format: 'Max UUID', formatId: 'uuid', value: 'ffffffff-ffff-ffff-ffff-ffffffffffff' },
  { format: 'ULID', formatId: 'ulid', value: '01ARZ3NDEKTSV4RRFFQ69G5FAV', note: 'Reference ULID from spec' },
  { format: 'KSUID', formatId: 'ksuid', value: '1srOrx2ZWZBpBUvZwXKQmoEYga2', note: 'Reference KSUID from Segment docs' },
  { format: 'MongoDB ObjectId', formatId: 'objectid', value: '507f1f77bcf86cd799439011', note: 'Common MongoDB tutorial example' },
  { format: 'Snowflake (Twitter)', formatId: 'snowflake-twitter', value: '1541815603606036480', note: 'A real Twitter / X tweet ID' },
  { format: 'Snowflake (Discord)', formatId: 'snowflake-discord', value: '175928847299117063', note: 'Discord developer docs example' },
  { format: 'Snowflake (Instagram)', formatId: 'snowflake-instagram', value: '2387123461222000142', note: 'Sharded ID, ~13-bit shard' },
  { format: 'NanoID (default 21)', formatId: 'nanoid', value: 'V1StGXR8_Z5jdHi6B-myT', note: '21-char NanoID example from docs' },
  { format: 'TSID', formatId: 'tsid', value: '0AXS751X42KTM', note: '13-char TSID' },
  { format: 'Xid', formatId: 'xid', value: '9m4e2mr0ui3e8a215n4g', note: 'Reference Xid from rs/xid README' },
  { format: 'CUID v1', formatId: 'cuid', value: 'ciyz3jha6000001la5g4k0gpv', note: 'CUID v1, lowercased' },
  { format: 'Stripe Customer', formatId: 'stripe', value: 'cus_NeZwdNtLEOXuvB', note: 'Customer object' },
  { format: 'Stripe PaymentIntent', formatId: 'stripe', value: 'pi_3MtwBwLkdIwHu7ix28a3tqPa', note: 'PaymentIntent' },
  { format: 'Stripe Secret Key (test)', formatId: 'stripe', value: 'sk_test_FAKEexample00000000000000', note: 'Synthetic test-mode key shape — not a real credential' },
  { format: 'Firebase push ID', formatId: 'firebase', value: '-N4l6vM7gZpQ8nB2cD9E', note: '20-char Firebase push ID' },
  { format: 'Unix seconds', formatId: 'unixtime', value: '1700000000', note: 'A round seconds-since-epoch' },
  { format: 'Unix milliseconds', formatId: 'unixtime', value: '1700000000123' },
];
