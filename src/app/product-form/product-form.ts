import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, linkedSignal, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../models/product.model';

type ProductField = 'name' | 'price' | 'stock' | 'category' | 'image';
type ProductErrors = Partial<Record<ProductField, string>>;

const CATEGORIES = ['Camisetas', 'Pantalones', 'Zapatos', 'Chaquetas', 'Sudaderas', 'Camisas'] as const;

@Component({
  selector: 'app-product-form',
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductForm {
  readonly product = input.required<Product>();
  readonly viewMode = input(false);
  readonly isEditing = input(false);

  readonly save = output<Product>();
  readonly cancel = output<void>();

  protected readonly categories = CATEGORIES;
  protected readonly errors = signal<ProductErrors>({});

  /** Copia editable del producto; se reinicia cuando el input `product` cambia. */
  protected readonly draft = linkedSignal<Product>(() => ({
    ...this.product(),
    category: this.product().category ?? '',
  }));

  protected patch<K extends keyof Product>(key: K, value: Product[K]): void {
    this.draft.update((product) => ({ ...product, [key]: value }));
  }

  protected onSubmit(): void {
    const product = this.draft();
    const errors: ProductErrors = {};

    if (!product.name || product.name.trim() === '') {
      errors.name = 'El nombre es obligatorio.';
    }

    if (!product.price || product.price <= 0) {
      errors.price = 'El precio debe ser mayor a 0.';
    }

    if (product.stock <= 0) {
      errors.stock = 'El stock debe ser mayor a 0.';
    }

    if (!product.category) {
      errors.category = 'Debes seleccionar una categoría.';
    }

    if (!product.image) {
      errors.image = 'La imagen es obligatoria.';
    }

    this.errors.set(errors);

    if (Object.keys(errors).length === 0) {
      this.save.emit(product);
    }
  }

  protected onCancel(): void {
    this.cancel.emit();
  }

  protected onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.patch('image', reader.result as string);
      this.errors.update((errors) => ({ ...errors, image: '' }));
    };
    reader.readAsDataURL(file);
  }
}