import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private storageKey = 'products';
  private platformId = inject(PLATFORM_ID);

  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$ = this.productsSubject.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.productsSubject.next(this.getProducts());

      window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key === this.storageKey) {
          this.productsSubject.next(this.getProducts());
        }
      });
    }
  }

  getProducts(): Product[] {
    if (!isPlatformBrowser(this.platformId)) return [];

    const data = localStorage.getItem(this.storageKey);
    const products: Product[] = data ? JSON.parse(data) : [];

    return products.map((p, index) => ({
      ...p,
      id: p.id ?? index + 1,
      stock: Number(p.stock ?? 0),
      price: Number(p.price ?? 0),
    }));
  }

  private saveProducts(products: Product[]) {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.setItem(this.storageKey, JSON.stringify(products));
    this.productsSubject.next([...products]);
  }

  setProducts(products: Product[]) {
    this.saveProducts(products);
  }

  addProduct(product: Product) {
    const products = this.getProducts();
    const newId =
      products.length > 0 ? Math.max(...products.map((p) => p.id || 0)) + 1 : 1;

    products.push({
      ...product,
      id: product.id ?? newId,
    });

    this.saveProducts(products);
  }

  updateProduct(product: Product) {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);

    if (index !== -1) {
      products[index] = {
        ...product,
        id: product.id,
      };
      this.saveProducts(products);
    }
  }

  updateStock(productId: number, newStock: number) {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === productId);

    if (index !== -1) {
      products[index].stock = Math.max(0, newStock);
      this.saveProducts(products);
    }
  }

  deleteProduct(index: number) {
    const products = this.getProducts();
    products.splice(index, 1);
    this.saveProducts(products);
  }

  deleteProductsByIds(ids: number[]) {
    const products = this.getProducts().filter((p) => !p.id || !ids.includes(p.id));
    this.saveProducts(products);
  }
}