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

  constructor(
    private productService: ProductService,
    private userService: UserService,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key === this.getCartKey()) {
          this.loadCart();
        }
      });
    }
  }

  private getCartKey(): string {
    const user = this.userService.getCurrentUser();
    return user ? `cart_${user.email}` : 'cart_guest';
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

  loadCart() {
    if (!isPlatformBrowser(this.platformId)) return;

    const key = this.getCartKey();
    const data = localStorage.getItem(key);

    this.items = data ? JSON.parse(data) : [];
    this.syncItemSnapshots();
    this.cartSubject.next([...this.items]);
  }

  getItems() {
    return this.items;
  }

  addToCart(product: Product) {
    if (!product.id) return;

    const current = this.getCurrentProduct(product.id);
    if (!current || current.stock <= 0) {
      alert('Sin stock');
      return;
    }

    const existing = this.items.find((item) => item.product.id === product.id);

    if (existing) {
      existing.cantidad++;
      existing.product.stock = current.stock - 1;
    } else {
      this.items.push({
        product: { ...current, stock: current.stock - 1 },
        cantidad: 1,
      });
    }

    this.productService.updateStock(product.id, current.stock - 1);
    this.cartSubject.next([...this.items]);
    this.saveCart();
  }

  removeItem(index: number) {
    const item = this.items[index];
    if (!item?.product.id) return;

    const current = this.getCurrentProduct(item.product.id);
    if (current) {
      this.productService.updateStock(item.product.id, current.stock + item.cantidad);
    }

    this.items.splice(index, 1);
    this.cartSubject.next([...this.items]);
    this.saveCart();
  }

  increase(item: CartItem) {
    if (!item.product.id) return;

    const current = this.getCurrentProduct(item.product.id);
    if (!current || current.stock <= 0) {
      alert('No hay más stock');
      return;
    }

    item.cantidad++;
    item.product.stock = current.stock - 1;

    this.productService.updateStock(item.product.id, current.stock - 1);
    this.cartSubject.next([...this.items]);
    this.saveCart();
  }

  decrease(item: CartItem) {
    if (!item.product.id) return;

    const current = this.getCurrentProduct(item.product.id);
    if (!current) return;

    if (item.cantidad > 1) {
      item.cantidad--;
      item.product.stock = current.stock + 1;
      this.productService.updateStock(item.product.id, current.stock + 1);
      this.cartSubject.next([...this.items]);
      this.saveCart();
      return;
    }

    const index = this.items.findIndex((i) => i.product.id === item.product.id);
    if (index !== -1) {
      this.removeItem(index);
    }
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
  }

  finalizePurchase() {
    this.items = [];
    this.cartSubject.next([]);
    this.saveCart();
  }

  getTotal() {
    return this.items.reduce((acc, item) => acc + item.product.price * item.cantidad, 0);
  }

  private saveCart() {
    if (!isPlatformBrowser(this.platformId)) return;

    const key = this.getCartKey();
    localStorage.setItem(key, JSON.stringify(this.items));
  }
}