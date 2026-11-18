import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Product } from '../models/product.model';
import { AuthSession } from '../core/auth/auth-session';
import { CartApi, ApiCartItem } from './cart-api';
import { ApiProduct } from './products-api';

export interface CartItem {
  product: Product;
  cantidad: number;
}

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

function toCartItem(item: ApiCartItem): CartItem {
  return { product: toProduct(item.product), cantidad: item.cantidad };
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly session = inject(AuthSession);
  private readonly cartApi = inject(CartApi);

  private readonly _items = signal<CartItem[]>([]);

  /** Ítems del carrito (solo lectura). */
  readonly items = this._items.asReadonly();
  /** Unidades totales en el carrito (badge del navbar). */
  readonly count = computed(() => this._items().reduce((acc, item) => acc + item.cantidad, 0));
  /** Valor total del carrito. */
  readonly total = computed(() =>
    this._items().reduce((acc, item) => acc + item.product.price * item.cantidad, 0),
  );

  private get canSync(): boolean {
    return isPlatformBrowser(this.platformId) && this.session.authenticated();
  }

  /** Carga el carrito del usuario desde el backend. */
  async loadCart(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!this.session.authenticated()) {
      this._items.set([]);
      return;
    }

    try {
      const cart = await firstValueFrom(this.cartApi.get());
      this._items.set(cart.items.map(toCartItem));
    } catch {
      /* Sin conexión: se conserva el estado actual. */
    }
  }

  addToCart(product: Product): boolean {
    if (!product.id) return false;

    if (product.stock <= 0) {
      alert('Sin stock');
      return false;
    }

    const items = this._items();
    const existing = items.find((item) => item.product.id === product.id);

    if (existing && existing.cantidad + 1 > product.stock) {
      alert('No hay más stock');
      return false;
    }

    const cantidad = existing ? existing.cantidad + 1 : 1;
    const next = existing
      ? items.map((item) =>
          item.product.id === product.id ? { ...item, cantidad } : item,
        )
      : [...items, { product: { ...product }, cantidad }];

    this._items.set(next);
    void this.pushItem(product.id, cantidad);
    return true;
  }

  removeItem(index: number): void {
    const item = this._items()[index];
    if (!item) return;

    this._items.set(this._items().filter((_, i) => i !== index));

    if (item.product.id) void this.removeOnServer(item.product.id);
  }

  increase(item: CartItem): void {
    if (!item.product.id) return;

    if (item.cantidad + 1 > item.product.stock) {
      alert('No hay más stock');
      return;
    }

    const cantidad = item.cantidad + 1;
    this._items.set(
      this._items().map((i) =>
        i.product.id === item.product.id ? { ...i, cantidad } : i,
      ),
    );

    void this.pushItem(item.product.id, cantidad);
  }

  decrease(item: CartItem): void {
    if (!item.product.id) return;

    const index = this._items().findIndex((i) => i.product.id === item.product.id);
    if (index === -1) return;

    if (this._items()[index].cantidad > 1) {
      const cantidad = this._items()[index].cantidad - 1;
      this._items.set(
        this._items().map((i, idx) => (idx === index ? { ...i, cantidad } : i)),
      );
      void this.pushItem(item.product.id, cantidad);
      return;
    }

    this.removeItem(index);
  }

  /** Vacía el carrito del usuario (también en el backend). */
  clearCart(): void {
    this._items.set([]);
    if (!this.canSync) return;

    void firstValueFrom(this.cartApi.clear()).catch(() => undefined);
  }

  /** Vacía solo el carrito en memoria (logout o compra ya registrada). */
  finalizePurchase(): void {
    this._items.set([]);
  }

  /** Limpia el estado local sin tocar el carrito guardado en el backend. */
  resetLocal(): void {
    this._items.set([]);
  }

  private async pushItem(productId: number, cantidad: number): Promise<void> {
    if (!this.canSync) return;

    try {
      await firstValueFrom(this.cartApi.upsert(productId, cantidad));
    } catch {
      await this.loadCart();
    }
  }

  private async removeOnServer(productId: number): Promise<void> {
    if (!this.canSync) return;

    try {
      await firstValueFrom(this.cartApi.remove(productId));
    } catch {
      await this.loadCart();
    }
  }
}
