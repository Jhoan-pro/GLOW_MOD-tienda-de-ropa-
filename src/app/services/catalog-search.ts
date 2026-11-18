import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CatalogSearch {
  readonly query = signal('');
}
