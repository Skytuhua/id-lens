export type Confidence = 'high' | 'medium' | 'low';

export interface DecodedField {
  label: string;
  value: string;
  hint?: string;
  mono?: boolean;
  copyable?: boolean;
  segment?: number;
}

export interface ByteLayout {
  bytes: number[];
  segments: { label: string; start: number; end: number; color: number }[];
}

export interface DecodeResult {
  format: string;
  formatId: string;
  confidence: Confidence;
  summary: string;
  fields: DecodedField[];
  layout?: ByteLayout;
  warnings?: string[];
  reference?: { label: string; url: string };
}

export interface Decoder {
  id: string;
  name: string;
  matches(input: string): Confidence | null;
  decode(input: string): DecodeResult;
}
