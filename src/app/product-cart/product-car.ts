import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../models/product.model';
import { CartService } from '../services/cart.service';
import { UserService } from '../services/user.service';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-product-car',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './product-car.html',
  styleUrls: ['./product-car.css']
})
export class ProductCar {
  showLoginAlert=false;
  @Input() products: Product[] = [];
  constructor(private cartService: CartService, private userService: UserService){}
  addToCart(product: any, index: number) {

  // No logueado
  if (!this.userService.isLoggedIn()) {
    this.showLoginAlert = true;
    return;
  }

  // Sin stock
  if (product.stock <= 0) return;

  product.added = true;

  setTimeout(() => {
    product.added = false;
  }, 500);

  this.cartService.addToCart(product, index);
}
}
