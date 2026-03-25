import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductForm } from '../product-form/product-form';
import { ProductService } from '../services/product';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ProductForm],
  templateUrl: './products.html',
  styleUrl: './products.css',
})


export class Products implements OnInit {

  products: any[] = [];

  constructor(private productService: ProductService) { }

  ngOnInit() {
    this.products = this.productService.getProducts();
  }

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

  closeModal() {
    this.showModal = false;
  }
}