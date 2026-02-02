import { Injectable } from '@angular/core';

/**
 * Client-side text encoder/decoder using a secret string and a number.
 * Preserves all whitespace (tab, space, newline, carriage return) so that
 * markdown, code indentation, and formatting are maintained.
 */
/** UTF-16 surrogate range: invalid when standalone, shows as */
const SURROGATE_LOW = 0xd800;
const SURROGATE_HIGH = 0xdfff;
/** Private Use Area: safe to store remapped surrogates (same size: 2048) */
const REMAP_BASE = 0xe000;

@Injectable({ providedIn: 'root' })
export class EncoderService {
  // ===== seed from string + number =====
private createSeed(key: string, num: number): number {
  let hash = num | 0;

  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }

  return hash;
}

// ===== tiny deterministic PRNG =====
private prng(seed: number) {
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  };
}

// ===== core byte transform =====
private transformBytes(data: Uint8Array, key: string, num: number): Uint8Array {
  if (!key || num === undefined || num === null)
    throw new Error("Missing key or number");

  const rand = this.prng(this.createSeed(key, num));
  const out = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i++) {
    out[i] = data[i] ^ (rand() & 0xff);
  }

  return out;
}

// ===== public API =====
encode(text: string, key: string, num: number): string {
  if (!text) throw new Error("Missing text");

  const bytes = new TextEncoder().encode(text);
  const encoded = this.transformBytes(bytes, key, num);

  return btoa(String.fromCharCode(...encoded));
}

decode(encoded: string, key: string, num: number): string {
  const raw = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
  const decoded = this.transformBytes(raw, key, num);

  return new TextDecoder().decode(decoded);
}

}
