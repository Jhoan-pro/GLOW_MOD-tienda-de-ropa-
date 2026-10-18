import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { ProductService } from './product';
import { UserService } from './user.service';

export interface CartItem {
  product: Product;
  cantidad: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly productService = inject(ProductService);
  private readonly userService = inject(UserService);

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
    const user = this.userService.getCurrentUser();
    const userKey = user?.id ?? user?.email ?? 'guest';
    return `cart_${userKey}`;
  }

  private getActivityKey(): string {
    return `${this.getCartKey()}_last_activity`;
  }

  private getCurrentProduct(productId: number): Product | undefined {
    return this.productService.getProducts().find((p) => p.id === productId);
  }

  /** Refresca la copia del producto de cada ítem con el catálogo actual (stock, precio…). */
  private withFreshSnapshots(items: CartItem[]): CartItem[] {
    const products = this.productService.getProducts();

    return items.map((item) => {
      const current = products.find((p) => p.id === item.product.id);
      return current ? { ...item, product: { ...current } } : item;
    });
  }

  /** Publica el nuevo estado, lo persiste y reinicia el contador de inactividad. */
  private commit(items: CartItem[]): void {
    this._items.set(this.withFreshSnapshots(items));
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

  private expireCart(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this._items().length === 0) return;

    this._items().forEach((item) => {
      if (!item.product.id) return;
      this.productService.updateStock(item.product.id, item.product.stock + item.cantidad);
    });

    this._items.set([]);
    this.saveCart();
    localStorage.removeItem(this.getActivityKey());
    this.clearExpiryTimer();

    alert('Tu carrito expiró por inactividad y el stock fue liberado.');
  }

  loadCart(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const data = localStorage.getItem(this.getCartKey());
    const stored: CartItem[] = data ? (JSON.parse(data) as CartItem[]) : [];

    this._items.set(this.withFreshSnapshots(stored));

    if (stored.length > 0 && !localStorage.getItem(this.getActivityKey())) {
      localStorage.setItem(this.getActivityKey(), Date.now().toString());
    }

    this.scheduleExpiry();
  }

  addToCart(product: Product): boolean {
    if (!product.id) return false;

    const current = this.getCurrentProduct(product.id);
    if (!current || current.stock <= 0) {
      alert('Sin stock');
      return false;
    }

    const items = this._items();
    const exists = items.some((item) => item.product.id === product.id);

    const next = exists
      ? items.map((item) =>
          item.product.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item,
        )
      : [...items, { product: { ...current }, cantidad: 1 }];

    this.productService.updateStock(product.id, current.stock - 1);
    this.commit(next);

    return true;
  }

  removeItem(index: number): void {
    const item = this._items()[index];
    if (!item?.product.id) return;

    const current = this.getCurrentProduct(item.product.id);
    if (current) {
      this.productService.updateStock(item.product.id, current.stock + item.cantidad);
    }

    this.commit(this._items().filter((_, i) => i !== index));
  }

  increase(item: CartItem): void {
    if (!item.product.id) return;

    const current = this.getCurrentProduct(item.product.id);
    if (!current || current.stock <= 0) {
      alert('No hay más stock');
      return;
    }

    this.productService.updateStock(item.product.id, current.stock - 1);
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

    const current = this.getCurrentProduct(item.product.id);
    if (!current) return;

    if (this._items()[index].cantidad > 1) {
      this.productService.updateStock(item.product.id, current.stock + 1);
      this.commit(
        this._items().map((i, idx) => (idx === index ? { ...i, cantidad: i.cantidad - 1 } : i)),
      );
      return;
    }

    this.removeItem(index);
  }

  /** Vacía el carrito devolviendo el stock al catálogo. */
  clearCart(): void {
    this._items().forEach((item) => {
      if (!item.product.id) return;

      const current = this.getCurrentProduct(item.product.id);
      if (current) {
        this.productService.updateStock(item.product.id, current.stock + item.cantidad);
      }
    });

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
