import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import {BehaviorSubject}from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CartService {

  private items: any[] = [];

  private cartSubject = new BehaviorSubject<any[]>([]);
  cart$ = this.cartSubject.asObservable();
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
      product: product, // 🔥 MISMA REFERENCIA
      cantidad: 1,
      index: index
    });
  }

  // 🔽 SOLO UNA VEZ
  product.stock--;

  this.cartSubject.next(this.items);
}
  

  removeItem(index: number) {

  const item = this.items[index];

  // 🔥 devolver stock
  item.product.stock += item.cantidad;

  this.items.splice(index, 1);
  this.cartSubject.next(this.items);
}

  increase(item: any) {

  if (item.product.stock <= 0) {
    alert("No hay más stock");
    return;
  }

  item.cantidad++;
  item.product.stock--;

  this.cartSubject.next(this.items);
}

  decrease(item: any) {

  if (item.cantidad > 1) {
    item.cantidad--;
    item.product.stock++; // 🔼 devolver stock
  }

  this.cartSubject.next(this.items);
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
}
}