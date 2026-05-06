import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductForm } from '../product-form/product-form';
import { ProductService } from '../services/product';
import { UserService } from '../services/user.service';
import { Product } from '../models/product.model';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ProductForm, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit, OnDestroy {
  products: Product[] = [];
  private sub?: Subscription;
  isSubAdmin: boolean = false;
  currentUserId?: number;

  constructor(
    private productService: ProductService,
    private userService: UserService
  ) {}

  ngOnInit() {
    const currentUser = this.userService.getCurrentUser();
    this.isSubAdmin = currentUser?.role === 'sub-admin';
    this.currentUserId = currentUser?.id;

    this.sub = this.productService.products$.subscribe(() => {
      if (this.isSubAdmin && this.currentUserId) {
        // sub-admin solo ve sus productos
        this.products = this.productService.getProductsByOwner(this.currentUserId);
      } else {
        // admin principal ve todos
        this.products = this.productService.getProducts();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  showModal: boolean = false;
  viewMode: boolean = false;
  editingIndex: number | null = null;
  currentProduct: Product = this.getEmptyProduct();

  getEmptyProduct(): Product {
    return {
      name: '',
      price: 0,
      stock: 0,
      category: '',
      description: '',
    };
  }

  openCreate() {
    this.currentProduct = this.getEmptyProduct();
    this.editingIndex = null;
    this.viewMode = false;
    this.showModal = true;
  }

  openEdit(index: number) {
    this.currentProduct = { ...this.products[index] };
    this.editingIndex = index;
    this.viewMode = false;
    this.showModal = true;
  }

  saveProduct(product: Product) {
    // si es sub-admin le asigna su id como dueño
    if (this.isSubAdmin && this.currentUserId) {
      product.ownerId = this.currentUserId;
    }

    if (this.editingIndex !== null) {
      this.productService.updateProduct(product);
    } else {
      this.productService.addProduct(product);
    }

    this.closeModal();
  }

  deleteProduct(index: number) {
    const confirmacion = confirm('¿Eliminar producto?');
    if (confirmacion) {
      this.productService.deleteProduct(index);
    }
  }

  deleteSelected() {
    const ids = this.products
      .filter((p) => p.selected && p.id)
      .map((p) => p.id as number);

    if (ids.length === 0) {
      alert('No has seleccionado ningún producto para eliminar.');
      return;
    }

    const confirmacion = confirm('¿Eliminar los productos seleccionados?');
    if (!confirmacion) return;

    this.productService.deleteProductsByIds(ids);
  }

  openView(index: number) {
    this.currentProduct = { ...this.products[index] };
    this.viewMode = true;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}