import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private storageKey = 'products';
  private platformid = inject (PLATFORM_ID);

  constructor() {}

  // Obtener productos
  getProducts(): Product[] {
    if(isPlatformBrowser(this.platformid)){
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
    }
    return [];
  }

  // Guardar lista completa
  private saveProducts(products: Product[]) {
    if(isPlatformBrowser(this.platformid)){
    localStorage.setItem(this.storageKey, JSON.stringify(products));

    }
  }

  // Agregar producto
  addProduct(product: Product) {
    const products = this.getProducts();
    products.push(product);
    this.saveProducts(products);
  }

  // Actualizar producto
  updateProduct(index: number, product: Product) {
    const products = this.getProducts();
    products[index] = product;
    this.saveProducts(products);
  }

  // Eliminar producto
  deleteProduct(index: number) {
    const products = this.getProducts();
    products.splice(index, 1);
    this.saveProducts(products);
  }
}