import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { AuthSession } from '../core/auth/auth-session';

export interface CartItem {
  product: Product;
  cantidad: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly session = inject(AuthSession);

  private readonly CART_TTL_MS = 30 * 60 * 1000; // 30 minutos
  private expiryTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly _items = signal<CartItem[]>([]);

  /** Ítems del carrito (solo lectura). */
  readonly items = this._items.asReadonly();
  /** Unidades totales en el carrito (badge del navbar). */
  readonly count = computed(() => this._items().reduce((acc, item) => acc + item.cantidad, 0));
  /** Valor total del carrito. */
  readonly total = computed(() =>
    this._items().reduce((acc, item) => acc + item.product.price * item.cantidad, 0),
  );

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key === this.getCartKey() || event.key === this.getActivityKey()) {
          this.loadCart();
        }
      });
    }
  }

  private getCartKey(): string {
    const user = this.session.user();
    const userKey = user?.id ?? user?.email ?? 'guest';
    return `cart_${userKey}`;
  }

  private getActivityKey(): string {
    return `${this.getCartKey()}_last_activity`;
  }

  /** Publica el nuevo estado, lo persiste y reinicia el contador de inactividad. */
  private commit(items: CartItem[]): void {
    this._items.set(items);
    this.saveCart();
    this.touchCartActivity();
  }

  private saveCart(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.setItem(this.getCartKey(), JSON.stringify(this._items()));
  }

  private clearExpiryTimer(): void {
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
  }

  private touchCartActivity(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.setItem(this.getActivityKey(), Date.now().toString());
    this.scheduleExpiry();
  }

  private scheduleExpiry(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.clearExpiryTimer();

    if (this._items().length === 0) {
      localStorage.removeItem(this.getActivityKey());
      return;
    }

    const lastActivityRaw = localStorage.getItem(this.getActivityKey());
    const lastActivity = lastActivityRaw ? Number(lastActivityRaw) : Date.now();
    const elapsed = Date.now() - lastActivity;
    const remaining = this.CART_TTL_MS - elapsed;

    if (remaining <= 0) {
      this.expireCart();
      return;
    }

    this.expiryTimer = setTimeout(() => this.expireCart(), remaining);
  }

  // El stock lo gestiona el backend al crear la orden; aquí solo se vacía el carrito.
  private expireCart(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this._items().length === 0) return;

    this._items.set([]);
    this.saveCart();
    localStorage.removeItem(this.getActivityKey());
    this.clearExpiryTimer();

    alert('Tu carrito expiró por inactividad.');
  }

  loadCart(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const data = localStorage.getItem(this.getCartKey());
    const stored: CartItem[] = data ? (JSON.parse(data) as CartItem[]) : [];

    this._items.set(stored);

    if (stored.length > 0 && !localStorage.getItem(this.getActivityKey())) {
      localStorage.setItem(this.getActivityKey(), Date.now().toString());
    }

    this.scheduleExpiry();
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

    const next = existing
      ? items.map((item) =>
          item.product.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item,
        )
      : [...items, { product: { ...product }, cantidad: 1 }];

    this.commit(next);
    return true;
  }

  removeItem(index: number): void {
    this.commit(this._items().filter((_, i) => i !== index));
  }

  increase(item: CartItem): void {
    if (!item.product.id) return;

    if (item.cantidad + 1 > item.product.stock) {
      alert('No hay más stock');
      return;
    }

    this.commit(
      this._items().map((i) =>
        i.product.id === item.product.id ? { ...i, cantidad: i.cantidad + 1 } : i,
      ),
    );
  }

  decrease(item: CartItem): void {
    if (!item.product.id) return;

    const index = this._items().findIndex((i) => i.product.id === item.product.id);
    if (index === -1) return;

    if (this._items()[index].cantidad > 1) {
      this.commit(
        this._items().map((i, idx) => (idx === index ? { ...i, cantidad: i.cantidad - 1 } : i)),
      );
      return;
    }

    this.removeItem(index);
  }

  /** Vacía el carrito. El stock ya lo controla el backend. */
  clearCart(): void {
    this.reset();
  }

  /** Vacía el carrito sin devolver stock (la compra se concretó). */
  finalizePurchase(): void {
    this.reset();
  }

  private reset(): void {
    this._items.set([]);
    this.saveCart();

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.getActivityKey());
    }

    this.clearExpiryTimer();
  }
}
