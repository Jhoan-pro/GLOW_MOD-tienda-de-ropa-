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
  ) {}

  private getCartKey(): string {
    const user = this.userService.getCurrentUser();
    return user ? `cart_${user.email}` : 'cart_guest';
  }

  loadCart() {
    if (!isPlatformBrowser(this.platformId)) return;

    const key = this.getCartKey();
    const data = localStorage.getItem(key);

    this.items = data ? JSON.parse(data) : [];

    this.syncStockWithCart();

    this.cartSubject.next([...this.items]);
  }

  getItems() {
    return this.items;
  }

  addToCart(product: Product) {
    const existing = this.items.find((item) => item.product.id === product.id);

    if (product.stock <= 0) {
      alert('Sin stock');
      return;
    }

    if (existing) {
      existing.cantidad++;
    } else {
      this.items.push({
        product: { ...product },
        cantidad: 1,
      });
    }

    product.stock--;

    this.productService.updateStock(product.id!, product.stock);

    this.cartSubject.next([...this.items]);
    this.saveCart();
  }

  removeItem(index: number) {
    const item = this.items[index];
    if (!item) return;

    item.product.stock += item.cantidad;

    this.productService.updateStock(item.product.id!, item.product.stock);

    this.items.splice(index, 1);
    this.cartSubject.next([...this.items]);
    this.saveCart();
  }

  increase(item: CartItem) {
    if (item.product.stock <= 0) {
      alert('No hay más stock');
      return;
    }

    item.cantidad++;
    item.product.stock--;

    this.productService.updateStock(item.product.id!, item.product.stock);

    this.cartSubject.next([...this.items]);
    this.saveCart();
  }

  decrease(item: CartItem) {
    if (item.cantidad > 1) {
      item.cantidad--;
      item.product.stock++;
      this.productService.updateStock(item.product.id!, item.product.stock);
    }

    this.cartSubject.next([...this.items]);
    this.saveCart();
  }

  getTotal() {
    return this.items.reduce((acc, item) => acc + item.product.price * item.cantidad, 0);
  }
  private saveCart() {
    if (isPlatformBrowser(this.platformId)) {
      const key = this.getCartKey();
      localStorage.setItem(key, JSON.stringify(this.items));
    }
  }

  clearCart() {
    this.items.forEach((item) => {
      const newStock = item.product.stock + item.cantidad;
      this.productService.updateStock(item.product.id!, newStock);
    });

    this.items = [];
    this.cartSubject.next([]);
    this.saveCart();
  }
  private syncStockWithCart() {
    const products = this.productService.getProducts();

    this.items.forEach((cartItem) => {
      const product = products.find((p) => p.id === cartItem.product.id);

      if (product) {
        product.stock -= cartItem.cantidad;

        if (product.stock < 0) {
          product.stock = 0;
        }

        // actualizar referencia
        cartItem.product = { ...product };
      }
    });

    //guardar cambios
    (this.productService as any).saveProducts(products);
  }
}
