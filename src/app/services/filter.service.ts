import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private readonly _category = signal('Todos');

  /** Categoría seleccionada (solo lectura). */
  readonly category = this._category.asReadonly();

  setCategory(category: string): void {
    this._category.set(category);
  }
}
