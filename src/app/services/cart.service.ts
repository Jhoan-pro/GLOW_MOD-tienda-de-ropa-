import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../models/product.model';
import { ProductService } from './product';
import { UserService } from './user.service';

interface CartItem {
  product: Product;
  cantidad: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private platformId = inject(PLATFORM_ID);

  private items: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  private readonly CART_TTL_MS = 10 * 60 * 1000; // 15 minutos
  private expiryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private productService: ProductService,
    private userService: UserService,
  ) {
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

  private syncItemSnapshots() {
    const products = this.productService.getProducts();

    this.items = this.items.map((item) => {
      const current = products.find((p) => p.id === item.product.id);
      return current ? { ...item, product: { ...current } } : item;
    });
  }

  private saveCart() {
    if (!isPlatformBrowser(this.platformId)) return;

    const key = this.getCartKey();
    localStorage.setItem(key, JSON.stringify(this.items));
  }

  private clearExpiryTimer() {
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
  }

  private touchCartActivity() {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.setItem(this.getActivityKey(), Date.now().toString());
    this.scheduleExpiry();
  }

  private scheduleExpiry() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.clearExpiryTimer();

    if (this.items.length === 0) {
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

    this.expiryTimer = setTimeout(() => {
      this.expireCart();
    }, remaining);
  }

  private expireCart() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.items.length === 0) return;

    this.items.forEach((item) => {
      if (!item.product.id) return;
      this.productService.updateStock(item.product.id, item.product.stock + item.cantidad);
    });

    this.items = [];
    this.cartSubject.next([]);
    this.saveCart();
    localStorage.removeItem(this.getActivityKey());
    this.clearExpiryTimer();

    alert('Tu carrito expiró por inactividad y el stock fue liberado.');
  }

  loadCart() {
    if (!isPlatformBrowser(this.platformId)) return;

    const key = this.getCartKey();
    const data = localStorage.getItem(key);

    this.items = data ? JSON.parse(data) : [];
    this.syncItemSnapshots();
    this.cartSubject.next([...this.items]);

    if (this.items.length > 0 && !localStorage.getItem(this.getActivityKey())) {
      localStorage.setItem(this.getActivityKey(), Date.now().toString());
    }

    this.scheduleExpiry();
  }

  getItems() {
    return this.items;
  }

  addToCart(product: Product): boolean {
    if (!product.id) return false;

    const current = this.getCurrentProduct(product.id);
    if (!current || current.stock <= 0) {
      alert('Sin stock');
      return false;
    }

    const existing = this.items.find((item) => item.product.id === product.id);

    if (existing) {
      existing.cantidad++;
    } else {
      this.items.push({
        product: { ...current },
        cantidad: 1,
      });
    }

    this.productService.updateStock(product.id, current.stock - 1);
    this.syncItemSnapshots();
    this.cartSubject.next([...this.items]);
    this.saveCart();
    this.touchCartActivity();

    return true;
  }

  removeItem(index: number) {
    const item = this.items[index];
    if (!item?.product.id) return;

    const current = this.getCurrentProduct(item.product.id);
    if (current) {
      this.productService.updateStock(item.product.id, current.stock + item.cantidad);
    }

    this.items.splice(index, 1);
    this.syncItemSnapshots();
    this.cartSubject.next([...this.items]);
    this.saveCart();
    this.touchCartActivity();
  }

  increase(item: CartItem) {
    if (!item.product.id) return;

    const current = this.getCurrentProduct(item.product.id);
    if (!current || current.stock <= 0) {
      alert('No hay más stock');
      return;
    }

    item.cantidad++;
    this.productService.updateStock(item.product.id, current.stock - 1);

    this.syncItemSnapshots();
    this.cartSubject.next([...this.items]);
    this.saveCart();
    this.touchCartActivity();
  }

  decrease(item: CartItem) {
    if (!item.product.id) return;

    const index = this.items.findIndex((i) => i.product.id === item.product.id);
    if (index === -1) return;

    const current = this.getCurrentProduct(item.product.id);
    if (!current) return;

    if (item.cantidad > 1) {
      item.cantidad--;
      this.productService.updateStock(item.product.id, current.stock + 1);

      this.syncItemSnapshots();
      this.cartSubject.next([...this.items]);
      this.saveCart();
      this.touchCartActivity();
      return;
    }

    this.removeItem(index);
  }

  clearCart() {
    this.items.forEach((item) => {
      if (!item.product.id) return;

      const current = this.getCurrentProduct(item.product.id);
      if (current) {
        this.productService.updateStock(item.product.id, current.stock + item.cantidad);
      }
    });

    this.items = [];
    this.cartSubject.next([]);
    this.saveCart();

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.getActivityKey());
    }

    this.clearExpiryTimer();
  }
  finalizePurchase() {
    this.items = [];
    this.cartSubject.next([]);
    this.saveCart();

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.getActivityKey());
    }

    this.clearExpiryTimer();
  }

  getTotal() {
    return this.items.reduce((acc, item) => acc + item.product.price * item.cantidad, 0);
  }
}
