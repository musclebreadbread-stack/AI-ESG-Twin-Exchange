/**
 * Deterministic JSON serialization and hashing.
 * Object keys are sorted lexicographically, strings are NFC-normalized.
 * This is the ONLY path for fingerprint/hash generation.
 */
import { createHash } from 'node:crypto';

/**
 * Produce a deterministic canonical JSON string.
 * - Object keys: sorted lexicographically
 * - Strings: NFC-normalized
 * - Arrays: order preserved
 * - Decimal values: caller must convert to string before passing
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, val) => {
    if (typeof val === 'string') {
      return val.normalize('NFC');
    }
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      const sorted: Record<string, unknown> = {};
      for (const k of Object.keys(val).sort()) {
        sorted[k] = (val as Record<string, unknown>)[k];
      }
      return sorted;
    }
    return val;
  });
}

/**
 * SHA-256 hex digest (64 chars) of a string input.
 */
export function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}
