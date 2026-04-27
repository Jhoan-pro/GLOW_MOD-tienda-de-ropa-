import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductCar } from '../product-cart/product-car';
import { ProductService } from '../services/product';
import { Product } from '../models/product.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [ProductCar],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  standalone: true
})
export class Home implements OnInit, OnDestroy {
  products: Product[] = [];
  private sub?: Subscription;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.sub = this.productService.products$.subscribe((products) => {
      this.products = products;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  irCatalogo() {
    document.getElementById('catalogo')?.scrollIntoView({
      behavior: 'smooth'
    });
  }
}