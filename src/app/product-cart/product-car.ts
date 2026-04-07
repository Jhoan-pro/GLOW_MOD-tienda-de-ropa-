import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-product-car',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-car.html',
  styleUrls: ['./product-car.css']
})
export class ProductCar {
  @Input() products: Product[] = [];

  addToCart(product: Product) {
    alert(`Producto agregado: ${product.name}`);
    // Aquí luego puedes integrar con tu servicio de carrito
  }
}
