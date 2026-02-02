import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'text', pathMatch: 'full' },
  {
    path: 'text',
    loadComponent: () =>
      import('./pages/text-encode-decode/text-encode-decode.component').then(
        (m) => m.TextEncodeDecodeComponent
      ),
  },
  { path: '**', redirectTo: 'text' },
];
