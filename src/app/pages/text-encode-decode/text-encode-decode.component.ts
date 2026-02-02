import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EncoderService } from '../../services/encoder.service';

@Component({
  selector: 'app-text-encode-decode',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './text-encode-decode.component.html',
  styleUrl: './text-encode-decode.component.scss',
})
export class TextEncodeDecodeComponent {
  secret = signal('');
  number = signal<number | null>(null);
  inputText = signal('');
  outputText = signal('');
  error = signal<string | null>(null);

  constructor(private encoder: EncoderService) {}

  encode(): void {
    this.error.set(null);
    const s = this.secret();
    const n = this.number();
    if (s === '') {
      this.error.set('Please enter a secret.');
      return;
    }
    if (n === null || Number.isNaN(n)) {
      this.error.set('Please enter a valid number.');
      return;
    }
    this.outputText.set(this.encoder.encode(this.inputText(), s, n));
  }

  decode(): void {
    this.error.set(null);
    const s = this.secret();
    const n = this.number();
    if (s === '') {
      this.error.set('Please enter a secret.');
      return;
    }
    if (n === null || Number.isNaN(n)) {
      this.error.set('Please enter a valid number.');
      return;
    }
    this.outputText.set(this.encoder.decode(this.inputText(), s, n));
  }

  onSecretChange(value: string): void {
    this.secret.set(value);
  }

  onNumberChange(value: string): void {
    const parsed = value === '' ? null : Number(value);
    this.number.set(parsed);
  }

  onInputChange(value: string): void {
    this.inputText.set(value);
  }

  copyOutput(): void {
    const out = this.outputText();
    if (out === '') return;
    navigator.clipboard.writeText(out);
  }
}
