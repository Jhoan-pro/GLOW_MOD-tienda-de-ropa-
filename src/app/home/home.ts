import { Component, OnInit } from '@angular/core';
import { Navbar } from "../navbar/navbar";
import { ProductCar } from "../product-cart/product-car";
import { ProductService } from '../services/product';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-home',
  imports: [ProductCar],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  standalone: true
})
export class Home implements OnInit {
  products: Product[] = [];
  
  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.products = this.productService.getProducts();
  }
  irCatalogo() {
  document.getElementById('catalogo')?.scrollIntoView({
    behavior: 'smooth'
  });
}
}
