import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { ProductForm } from '../product-form/product-form';
import { ProductService } from '../services/product';
import { UserService } from '../services/user.service';

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

@Component({
  selector: 'app-products',
  imports: [ProductForm],
  templateUrl: './products.html',
  styleUrl: './products.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {
  private readonly productService = inject(ProductService);
  private readonly userService = inject(UserService);

  private readonly currentUser = this.userService.currentUser;
  private readonly currentUserId = computed(() => this.currentUser()?.id);
  protected readonly isSubAdmin = computed(() => this.currentUser()?.role === 'sub-admin');

  /** Sub-admin ve solo sus productos; el admin principal ve todos. */
  protected readonly products = computed(() => {
    const all = this.productService.products();
    const ownerId = this.currentUserId();
    return this.isSubAdmin() && ownerId ? all.filter((p) => p.ownerId === ownerId) : all;
  });

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

  protected saveProduct(product: Product): void {
    // Si es sub-admin, se le asigna su id como dueño
    const ownerId = this.currentUserId();
    const toSave = this.isSubAdmin() && ownerId ? { ...product, ownerId } : product;

    if (this.isEditing()) {
      this.productService.updateProduct(toSave);
    } else {
      this.productService.addProduct(toSave);
    }

    this.closeModal();
  }

  protected deleteSelected(): void {
    const ids = this.products().flatMap((p) => (p.id && this.isSelected(p) ? [p.id] : []));

    if (ids.length === 0) {
      this.openConfirm('No has seleccionado ningún producto.', () => {}, true);
      return;
    }

    this.openConfirm('¿Eliminar los productos seleccionados?', () => {
      this.productService.deleteProductsByIds(ids);
      this.selectedIds.set(new Set());
    });
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