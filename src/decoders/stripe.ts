import type { Decoder, DecodeResult, Confidence } from '../types';

// Stripe-style IDs: <prefix>_<body> where prefix maps to object type.
// Test-mode keys: sk_test_, pk_test_, rk_test_.
// Live: sk_live_, pk_live_, rk_live_.
const STRIPE_RE = /^[a-z]{2,7}(_test|_live)?_[A-Za-z0-9]{6,}$/;

const PREFIX_TABLE: Record<string, string> = {
  acct: 'Account',
  ba: 'Bank Account',
  card: 'Card',
  ch: 'Charge',
  cn: 'Credit Note',
  cs: 'Checkout Session',
  cus: 'Customer',
  dp: 'Dispute',
  ent: 'Entitlement',
  evt: 'Event',
  fee: 'Application Fee',
  file: 'File',
  in: 'Invoice',
  inv: 'Invoice',
  inv_item: 'Invoice Item',
  ii: 'Invoice Item',
  iss: 'Issuing object',
  link: 'Payment Link',
  mandate: 'Mandate',
  meter: 'Meter',
  pi: 'PaymentIntent',
  pm: 'PaymentMethod',
  po: 'Payout',
  price: 'Price',
  prod: 'Product',
  prv: 'Promotion Code',
  promo: 'Promotion Code',
  py: 'Plan',
  re: 'Refund',
  rcpt: 'Receipt',
  setup: 'Setup Attempt',
  seti: 'SetupIntent',
  src: 'Source (legacy)',
  sub: 'Subscription',
  sub_sched: 'Subscription Schedule',
  tax: 'Tax Rate',
  tok: 'Token',
  topup: 'Top-up',
  tr: 'Transfer',
  tu: 'Top-up',
  txn: 'Balance Transaction',
  whsec: 'Webhook signing secret',
  whsync: 'Webhook sync',
  whk: 'Webhook endpoint',
};

const KEY_PREFIXES: Record<string, string> = {
  sk: 'Secret API Key',
  pk: 'Publishable API Key',
  rk: 'Restricted API Key',
};

export const stripeDecoder: Decoder = {
  id: 'stripe',
  name: 'Stripe-style ID',

  matches(input: string): Confidence | null {
    const s = input.trim();
    if (!STRIPE_RE.test(s)) return null;
    const head = s.split('_')[0];
    if (PREFIX_TABLE[head] || KEY_PREFIXES[head]) return 'high';
    // Unknown prefix but Stripe shape — medium so users still see something
    return 'medium';
  },

  decode(input: string): DecodeResult {
    const s = input.trim();
    const parts = s.split('_');
    const prefix = parts[0];
    let objectType = PREFIX_TABLE[prefix];
    let mode: 'live' | 'test' | 'unknown' = 'unknown';
    let body = parts.slice(1).join('_');

    if (KEY_PREFIXES[prefix]) {
      objectType = KEY_PREFIXES[prefix];
      if (parts[1] === 'test') {
        mode = 'test';
        body = parts.slice(2).join('_');
      } else if (parts[1] === 'live') {
        mode = 'live';
        body = parts.slice(2).join('_');
      }
    }

    if (!objectType) objectType = `Unknown (prefix "${prefix}")`;

    const fields = [
      { label: 'Canonical', value: s, mono: true, copyable: true },
      { label: 'Prefix', value: prefix, mono: true, segment: 2 },
      { label: 'Object type', value: objectType, segment: 2 },
    ];

    if (mode !== 'unknown') {
      fields.push({ label: 'Mode', value: mode === 'live' ? 'LIVE' : 'TEST', segment: 5 });
    }
    fields.push({ label: 'Body', value: body, mono: true, segment: 4 });

    const warnings: string[] = [];
    if (KEY_PREFIXES[prefix]) {
      warnings.push('This is an API key shape — never share secret keys publicly.');
    }
    if (!PREFIX_TABLE[prefix] && !KEY_PREFIXES[prefix]) {
      warnings.push('Prefix is not in the curated Stripe prefix table. May not be a real Stripe ID.');
    }

    return {
      format: 'Stripe-style ID',
      formatId: 'stripe',
      confidence: PREFIX_TABLE[prefix] || KEY_PREFIXES[prefix] ? 'high' : 'medium',
      summary: `${objectType}${mode !== 'unknown' ? ` (${mode} mode)` : ''}. Stripe prefix-typed identifier.`,
      fields,
      warnings: warnings.length ? warnings : undefined,
      reference: { label: 'Stripe API reference', url: 'https://stripe.com/docs/api' },
    };
  },
};
