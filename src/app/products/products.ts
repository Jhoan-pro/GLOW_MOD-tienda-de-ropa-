import { ChangeDetectionStrategy, Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Product } from '../models/product.model';
import { ProductForm } from '../product-form/product-form';
import { ProductsApi, ApiProduct, ProductInput } from '../services/products-api';
import { AuthSession } from '../core/auth/auth-session';

interface ConfirmState {
  message: string;
  action: () => void;
  onlyInfo: boolean;
}

const EMPTY_PRODUCT: Product = {
  name: '',
  price: 0,
  stock: 0,
  category: '',
  description: '',
};

function toProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    ownerId: p.ownerId ?? undefined,
    name: p.name,
    price: p.price,
    stock: p.stock,
    category: p.category,
    description: p.description,
    image: p.image ?? undefined,
  };
}

function toInput(p: Product): ProductInput {
  return {
    name: p.name,
    price: p.price,
    stock: p.stock,
    category: p.category,
    description: p.description,
    image: p.image,
  };
}

@Component({
  selector: 'app-products',
  imports: [ProductForm],
  templateUrl: './products.html',
  styleUrl: './products.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {
  private readonly productsApi = inject(ProductsApi);
  private readonly session = inject(AuthSession);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly isSubAdmin = computed(
    () => (this.session.user()?.role ?? '').toLowerCase() === 'sub-admin',
  );

  /** Sub-admin ve solo sus productos; el admin principal ve todos. */
  protected readonly products = signal<Product[]>([]);
  protected readonly search = signal('');
  protected readonly page = signal(0);
  protected readonly pageSize = 10;
  protected readonly hasPrev = computed(() => this.page() > 0);
  protected readonly hasNext = signal(false);

  // Selección
  private readonly selectedIds = signal<ReadonlySet<number>>(new Set());
  protected readonly allSelected = computed(() => {
    const products = this.products();
    return products.length > 0 && products.every((p) => this.isSelected(p));
  });

  // Modales
  protected readonly confirmState = signal<ConfirmState | null>(null);
  protected readonly showModal = signal(false);
  protected readonly viewMode = signal(false);
  protected readonly isEditing = signal(false);
  protected readonly currentProduct = signal<Product>({ ...EMPTY_PRODUCT });

  constructor() {
    if (isPlatformBrowser(this.platformId)) void this.loadProducts();
  }

  private async loadProducts(): Promise<void> {
    try {
      const ownerId = this.isSubAdmin() ? this.session.user()?.id : undefined;
      const list = await firstValueFrom(
        this.productsApi.list(ownerId, {
          search: this.search(),
          skip: this.page() * this.pageSize,
          take: this.pageSize + 1,
        }),
      );
      this.hasNext.set(list.length > this.pageSize);
      this.products.set(list.slice(0, this.pageSize).map(toProduct));
    } catch (error) {
      console.error('No se pudieron cargar los productos', error);
    }
  }

  protected setSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    this.page.set(0);
    void this.loadProducts();
  }

  protected prevPage(): void {
    if (!this.hasPrev()) return;
    this.page.update((page) => page - 1);
    void this.loadProducts();
  }

  protected nextPage(): void {
    if (!this.hasNext()) return;
    this.page.update((page) => page + 1);
    void this.loadProducts();
  }

  protected isSelected(product: Product): boolean {
    return product.id !== undefined && this.selectedIds().has(product.id);
  }

  protected toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedIds.set(
      checked ? new Set(this.products().flatMap((p) => (p.id !== undefined ? [p.id] : []))) : new Set(),
    );
  }

  protected toggleOne(product: Product, event: Event): void {
    if (product.id === undefined) return;

    const id = product.id;
    const checked = (event.target as HTMLInputElement).checked;

    this.selectedIds.update((ids) => {
      const next = new Set(ids);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  protected openCreate(): void {
    this.currentProduct.set({ ...EMPTY_PRODUCT });
    this.isEditing.set(false);
    this.viewMode.set(false);
    this.showModal.set(true);
  }

  protected openEdit(product: Product): void {
    this.currentProduct.set({ ...product });
    this.isEditing.set(true);
    this.viewMode.set(false);
    this.showModal.set(true);
  }

  protected openView(product: Product): void {
    this.currentProduct.set({ ...product });
    this.viewMode.set(true);
    this.showModal.set(true);
  }

  protected closeModal(): void {
    this.showModal.set(false);
  }

  protected async saveProduct(product: Product): Promise<void> {
    try {
      if (this.isEditing() && product.id !== undefined) {
        await firstValueFrom(this.productsApi.update(product.id, toInput(product)));
      } else {
        await firstValueFrom(this.productsApi.create(toInput(product)));
      }
      this.closeModal();
      await this.loadProducts();
    } catch (error) {
      console.error('No se pudo guardar el producto', error);
      this.openConfirm('No se pudo guardar el producto.', () => {}, true);
    }
  }

  protected deleteSelected(): void {
    const ids = this.products().flatMap((p) => (p.id !== undefined && this.isSelected(p) ? [p.id] : []));

    if (ids.length === 0) {
      this.openConfirm('No has seleccionado ningún producto.', () => {}, true);
      return;
    }

    this.openConfirm('¿Eliminar los productos seleccionados?', () => {
      void this.removeProducts(ids);
    });
  }

  private async removeProducts(ids: number[]): Promise<void> {
    try {
      for (const id of ids) {
        await firstValueFrom(this.productsApi.remove(id));
      }
      this.selectedIds.set(new Set());
      await this.loadProducts();
    } catch (error) {
      console.error('No se pudieron eliminar los productos', error);
      this.openConfirm('No se pudieron eliminar los productos.', () => {}, true);
    }
  }

  protected openConfirm(message: string, action: () => void, onlyInfo = false): void {
    this.confirmState.set({ message, action, onlyInfo });
  }

  protected confirm(): void {
    this.confirmState()?.action();
    this.confirmState.set(null);
  }

  protected cancelConfirm(): void {
    this.confirmState.set(null);
  }
}
