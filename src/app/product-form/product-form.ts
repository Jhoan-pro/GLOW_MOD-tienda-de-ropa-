import { Component, Input, Output, EventEmitter, OnInit, NgZone } from '@angular/core';
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
export class ProductForm implements OnInit {
  errors: any = {};

  categories: string[] = [
    'Camisetas',
    'Pantalones',
    'Zapatos',
    'Chaquetas',
    'Sudaderas',
    'Camisas',
  ];

  @Input() product!: Product;
  @Input() viewMode: boolean = false;
  @Input() isEditing: boolean = false;

  @Output() save = new EventEmitter<Product>();
  @Output() cancel = new EventEmitter<void>();
  constructor(private zone: NgZone) {}

  ngOnInit() {
    if (!this.product.category) {
      this.product.category = '';
    }
    this.resetErrors();
  }

  private resetErrors() {
    this.errors = {
      name: '',
      price: '',
      stock: '',
      category: '',
      image: '',
    };
  }

  onSubmit() {
    this.resetErrors();
    let isValid = true;

    // Validación de Nombre
    if (!this.product.name || this.product.name.trim() === '') {
      this.errors.name = 'El nombre es obligatorio.';
      isValid = false;
    }

    // Validación de Precio
    if (!this.product.price || this.product.price <= 0) {
      this.errors.price = 'El precio debe ser mayor a 0.';
      isValid = false;
    }

    // Validación de Stock
    if (this.product.stock <= 0) {
      this.errors.stock = 'El stock debe ser mayor a 0.';
      isValid = false;
    }

    // Validación de Categoría
    if (!this.product.category) {
      this.errors.category = 'Debes seleccionar una categoría.';
      isValid = false;
    }

    // Validación de Imagen
    if (!this.product.image) {
      this.errors.image = 'La imagen es obligatoria.';
      isValid = false;
    }

    if (isValid) {
      this.save.emit(this.product);
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.zone.run(() => {
          this.product.image = reader.result as string;
          this.errors.image = ''; // Limpiamos error si lo había
        });
      };
      reader.readAsDataURL(file);
    }
  }
}
