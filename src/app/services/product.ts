import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private storageKey = 'products';

  constructor() {}

  // Obtener productos
  getProducts(): any[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  // Guardar lista completa
  private saveProducts(products: any[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(products));
  }

  // Agregar producto
  addProduct(product: any) {
    const products = this.getProducts();
    products.push(product);
    this.saveProducts(products);
  }

  // Actualizar producto
  updateProduct(index: number, product: any) {
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