import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../models/product.model';
import { ProductService } from './product';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private platformId = inject(PLATFORM_ID);

  private items: any[] = [];
  private cartSubject = new BehaviorSubject<any[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor(
    private productService: ProductService,
    private userService: UserService
  ) {}


  private getCartKey(): string {
    const user = this.userService.getCurrentUser();
    return user ? `cart_${user.email}` : 'cart_guest';
  }


  loadCart() {
  if (isPlatformBrowser(this.platformId)) {
    const key = this.getCartKey();
    const data = localStorage.getItem(key);

    this.items = data ? JSON.parse(data) : []; 

    this.cartSubject.next([...this.items]); 
  }
}

  
  private saveCart() {
    if (isPlatformBrowser(this.platformId)) {
      const key = this.getCartKey();
      localStorage.setItem(key, JSON.stringify(this.items));
    }
  }

  
  getItems() {
    return this.items;
  }

  
  addToCart(product: Product, index: number) {

    const existing = this.items.find(item => item.index === index);

    if (product.stock <= 0) {
      alert("Sin stock");
      return;
    }

    if (existing) {
      existing.cantidad++;
    } else {
      this.items.push({
        product,
        cantidad: 1,
        index
      });
    }

    product.stock--;

    this.cartSubject.next(this.items);
    this.saveCart();
  }

  removeItem(index: number) {

    const item = this.items[index];

    item.product.stock += item.cantidad;

    this.items.splice(index, 1);

    this.cartSubject.next(this.items);
    this.saveCart();
  }

 
  increase(item: any) {

    if (item.product.stock <= 0) {
      alert("No hay más stock");
      return;
    }

    item.cantidad++;
    item.product.stock--;

    this.cartSubject.next(this.items);
    this.saveCart();
  }

 
  decrease(item: any) {

    if (item.cantidad > 1) {
      item.cantidad--;
      item.product.stock++;
    }

    this.cartSubject.next(this.items);
    this.saveCart();
  }

 
  getTotal() {
    return this.items.reduce(
      (acc, item) => acc + item.product.price * item.cantidad,
      0
    );
  }

  
  clearCart() {

    this.items.forEach(item => {
      item.product.stock += item.cantidad;
    });

    this.items = [];

    this.cartSubject.next(this.items);
    this.saveCart();
  }

  
  private syncStockWithCart() {

    const products = this.productService.getProducts();

    this.items.forEach(cartItem => {

      const index = cartItem.index;

      if (products[index]) {

        products[index].stock -= cartItem.cantidad;

        if (products[index].stock < 0) {
          products[index].stock = 0;
        }

        cartItem.product = products[index];
      }
    });

    this.productService['saveProducts'](products);
  }
}