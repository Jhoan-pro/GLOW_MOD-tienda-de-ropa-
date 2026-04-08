import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../models/product.model';
import { CartService } from '../services/cart.service';
@Component({
  selector: 'app-product-car',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-car.html',
  styleUrls: ['./product-car.css']
})
export class ProductCar {
  @Input() products: Product[] = [];
  constructor(private cartService: CartService){}
  addToCart(product: Product, index: number) {

  if (product.stock <= 0) return;

  

  this.cartService.addToCart(product, index);
}
}
