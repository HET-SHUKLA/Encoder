import { Injectable } from '@angular/core';

/**
 * Client-side text encoder/decoder using a secret string and a number.
 * Preserves all whitespace (tab, space, newline, carriage return) so that
 * markdown, code indentation, and formatting are maintained.
 */
@Injectable({ providedIn: 'root' })
export class EncoderService {
  /** Character codes we preserve: tab, newline, carriage return, space */
  private static readonly WHITESPACE_CODES = new Set([9, 10, 13, 32]);

  private static isWhitespace(code: number): boolean {
    return EncoderService.WHITESPACE_CODES.has(code);
  }

  /**
   * Builds a deterministic key stream from secret and number for XOR.
   * Uses secret characters and number to generate values 0..65535 for each position.
   */
  private buildKeyStream(length: number, secret: string, number: number): number[] {
    const keyStream: number[] = [];
    const slen = secret.length;
    for (let i = 0; i < length; i++) {
      const base = slen > 0 ? secret.charCodeAt(i % slen) : 0;
      keyStream.push((base + number * (i + 1)) & 0xffff);
    }
    return keyStream;
  }

  /**
   * Encodes text using secret and number. All tabs, spaces, and newlines are preserved.
   */
  encode(text: string, secret: string, number: number): string {
    const count = this.nonWhitespaceCount(text);
    const keyStream = this.buildKeyStream(count, secret, number);
    let keyIndex = 0;
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (EncoderService.isWhitespace(code)) {
        result += text[i];
      } else {
        const key = keyStream[keyIndex++] ?? 0;
        result += String.fromCharCode((code ^ key) & 0xffff);
      }
    }
    return result;
  }

  /**
   * Decodes text that was encoded with the same secret and number.
   * Decoding is the same as encoding (XOR is self-inverse); whitespace is preserved.
   */
  decode(text: string, secret: string, number: number): string {
    return this.encode(text, secret, number);
  }

  private nonWhitespaceCount(text: string): number {
    let count = 0;
    for (let i = 0; i < text.length; i++) {
      if (!EncoderService.isWhitespace(text.charCodeAt(i))) count++;
    }
    return count;
  }
}
