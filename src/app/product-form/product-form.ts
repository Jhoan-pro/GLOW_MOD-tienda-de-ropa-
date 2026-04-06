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

  @Input() product!: Product;
  @Input() viewMode: boolean = false;

  @Output() save = new EventEmitter<Product>();
  @Output() cancel = new EventEmitter<void>();

  onSubmit() {
    if (!this.product.name || !this.product.price) {
      alert('Nombre y precio son obligatorios');
      return;
    }

    this.save.emit(this.product);
  }

  onCancel() {
    this.cancel.emit();
  }


  onImageSelected(event: any) {
  const file = event.target.files[0];

  if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
    this.product.image = reader.result as string;
  };

  reader.readAsDataURL(file);
}
}