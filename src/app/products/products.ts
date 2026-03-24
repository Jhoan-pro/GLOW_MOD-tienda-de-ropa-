import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {

  // Lista de productos
  products: any[] = [];

  // Control del modal
  showModal: boolean = false;

  // Modelo del formulario
  newProduct = {
    name: '',
    price: 0,
    stock: 0,
    category: '',
    description: ''
  };

  // Abrir modal
  openModal() {
    this.showModal = true;
  }

  // Cerrar modal
  closeModal() {
    this.showModal = false;
  }

  // Guardar producto
  saveProduct() {
    if (!this.newProduct.name || !this.newProduct.price) {
      alert('Nombre y precio son obligatorios');
      return;
    }

    this.products.push({ ...this.newProduct });

    // Limpiar formulario
    this.newProduct = {
      name: '',
      price: 0,
      stock: 0,
      category: '',
      description: ''
    };

    this.closeModal();
  }
}