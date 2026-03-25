import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm {

  @Input() product: any = {
    name: '',
    price: 0,
    stock: 0,
    category: '',
    description: ''
  };

  @Output() save = new EventEmitter<any>();
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
}