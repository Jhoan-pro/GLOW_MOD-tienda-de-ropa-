import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})


export class ProductForm {
  categories: string[] = [
    'Camisetas (T-shirts)',
    'Camisas y Polos',
    'Tops y Tirantes',
    'Jeans y Vaqueros',
    'Pantalones Chinos y de Vestir',
    'Shorts y Bermudas',
    'Sudaderas y Jerseys',
    'Chaquetas y Abrigos',
    'Calzado y Zapatillas',
    'Complementos y Cinturones',

  ];

  

  @Input() product!: Product;
  @Input() viewMode: boolean = false;

  @Output() save = new EventEmitter<Product>();
  @Output() cancel = new EventEmitter<void>();

  ngOnInit() {
    // Si el producto es nuevo y no tiene categoría, inicializamos el valor
    if (!this.product.category) {
      this.product.category = "";
    }
    
  }

  onSubmit() {
    if (!this.product.category) {
  alert('Debes seleccionar una categoría');
  return;
}

    if (!this.product.name || this.product.price <= 0) {
      alert('Por favor, ingresa un nombre y un precio válido.');
      return;
    }
    this.save.emit(this.product);
  }

  onCancel() {
    this.cancel.emit();
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.product.image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}