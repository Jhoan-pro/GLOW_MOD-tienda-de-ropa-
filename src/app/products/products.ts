import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductForm } from '../product-form/product-form';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ProductForm],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {

  products: any[] = [];

  showModal: boolean = false;
  editingIndex: number | null = null;

  currentProduct: any = this.getEmptyProduct();

  getEmptyProduct() {
    return {
      name: '',
      price: 0,
      stock: 0,
      category: '',
      description: ''
    };
  }

  openCreate() {
    this.currentProduct = this.getEmptyProduct();
    this.editingIndex = null;
    this.showModal = true;
  }

  openEdit(index: number) {
    this.currentProduct = { ...this.products[index] };
    this.editingIndex = index;
    this.showModal = true;
  }

  saveProduct(product: any) {
    if (this.editingIndex !== null) {
      this.products[this.editingIndex] = product;
    } else {
      this.products.push(product);
    }

    this.closeModal();
  }

  deleteProduct(index: number) {
    const confirmacion = confirm('¿Eliminar producto?');
    if (confirmacion) {
      this.products.splice(index, 1);
    }
  }

  closeModal() {
    this.showModal = false;
  }
}