import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductForm } from '../product-form/product-form';
import { ProductService } from '../services/product';
import { Product } from '../models/product.model';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ProductForm, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})


export class Products implements OnInit {

  products: Product[] = [];

  constructor(private productService: ProductService) { }

  ngOnInit() {
    this.products = this.productService.getProducts();
  }

  showModal: boolean = false;
  editingIndex: number | null = null;

  currentProduct: Product = this.getEmptyProduct();

  getEmptyProduct() : Product {
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
      this.productService.updateProduct(this.editingIndex, product);
    } else {
      this.productService.addProduct(product);
    }

    this.products = this.productService.getProducts();
    this.closeModal();
  }

  deleteProduct(index: number) {
    const confirmacion = confirm('¿Eliminar producto?');

    if (confirmacion) {
      this.productService.deleteProduct(index);
      this.products = this.productService.getProducts();
    }
  }

  deleteSelected() {
  const confirmacion = confirm('¿Eliminar productos seleccionados?');

  if (!confirmacion) return;

  this.products = this.products.filter(p => !p.selected);

  this.productService['saveProducts'](this.products); // guardar cambios
}

  closeModal() {
    this.showModal = false;
  }
}