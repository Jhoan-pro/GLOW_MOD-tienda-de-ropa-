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
  if (isPlatformBrowser(this.platformid)) {
    const data = localStorage.getItem(this.storageKey);
    const products: Product[] = data ? JSON.parse(data) : [];

    return products.map((p, index) => ({
      ...p,
      id: p.id ?? index + 1
    }));
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
 const newId = products.length > 0
  ? Math.max(...products.map(p => p.id || 0)) + 1
  : 1;

  products.push({
    ...product,
    id: product.id ?? newId,
  });

  this.saveProducts(products);
}

  // Actualizar producto
  updateProduct(product: Product) {
  const products = this.getProducts();
  const index = products.findIndex(p => p.id === product.id);

  if (index !== -1) {
    products[index] = product;
    this.saveProducts(products);
  }
}
  updateStock(productId: number, newStock: number) {
  const products = this.getProducts();
  const index = products.findIndex(p => p.id === productId);

  if (index !== -1) {
    products[index].stock = newStock;
    this.saveProducts(products);
  }
}

  // Eliminar producto
  deleteProduct(index: number) {
    const products = this.getProducts();
    products.splice(index, 1);
    this.saveProducts(products);
  }
}