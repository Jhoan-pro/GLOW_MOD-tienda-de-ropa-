import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import {BehaviorSubject}from 'rxjs';
import { json } from 'stream/consumers';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { ProductService } from './product';
@Injectable({
  providedIn: 'root'
})
export class CartService {
  private platformId = inject(PLATFORM_ID);
  private items: any[] = [];
  private storageKey= 'cart';
  private cartSubject = new BehaviorSubject<any[]>([]);
  cart$ = this.cartSubject.asObservable();
  getItems() {
    return this.items;
  }
  
  constructor(private productService: ProductService) {

  if (isPlatformBrowser(this.platformId)) {

    const data = localStorage.getItem(this.storageKey);

    if (data) {
      this.items = JSON.parse(data);
      this.syncStockWithCart();
      this.cartSubject.next(this.items);
    }

  }
}
  private saveCart() {

  if (isPlatformBrowser(this.platformId)) {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items));
  }

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
      product: product, // misma referencia
      cantidad: 1,
      index: index
    });
  }

  // SOLO UNA VEZ
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
    item.product.stock++; // devolver stock
  }

  this.cartSubject.next(this.items);
  this.saveCart();
}

  getTotal() {
  return this.items.reduce((acc, item) => acc + item.product.price * item.cantidad, 0);
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

      // evitar negativos
      if (products[index].stock < 0) {
        products[index].stock = 0;
      }

      // actualizar referencia
      cartItem.product = products[index];
    }

  });
this.productService['saveProducts'](products);
}

}
