import { Component, Input, OnChanges, OnInit, SimpleChanges, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Product } from '../models/product.model';
import { CartService } from '../services/cart.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-car',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-car.html',
  styleUrls: ['./product-car.css']
})
export class ProductCar implements OnInit, OnChanges {
  showLoginAlert = false;
  isAdminView = false;

  @Input() products: Product[] = [];

  currentCategory: string | null = null;

  constructor(
    private cartService: CartService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  trackById(_: number, item: Product) {
    return item.id ?? item.name;
  }

  private checkCurrentRoute() {
    this.isAdminView = this.router.url.includes('admin-dashboard/dashBoard');
  }

  ngOnInit() {
    this.checkCurrentRoute();

    this.route.params.subscribe((params) => {
      this.currentCategory = params['nombre'] ?? null;
    });
  }

  ngOnChanges(_: SimpleChanges) {
    this.checkCurrentRoute();
  }

  get visibleProducts(): Product[] {
    if (!this.currentCategory) return this.products;

    return this.products.filter(
      (p) =>
        p.category?.toLowerCase().trim() ===
        this.currentCategory!.toLowerCase().trim()
    );
  }

  get categories(): string[] {
    return [...new Set(this.visibleProducts.map((p) => p.category).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );
  }

  getProductsByCategory(category: string) {
    return this.visibleProducts.filter(
      (p) => p.category.toLowerCase().trim() === category.toLowerCase().trim()
    );
  }

  addToCart(product: Product) {
    if (this.isAdminView) return;

    if (!this.userService.isLoggedIn()) {
      this.showLoginAlert = true;
      return;
    }

    product.added = true;

    setTimeout(() => {
      product.added = false;
    }, 500);

    this.cartService.addToCart(product);
  }
  //Alerta de compra sino esta registrado aun
  closeLoginAlert() {
  this.showLoginAlert = false;
}

goToLogin() {
  this.showLoginAlert = false;
  this.router.navigate(['/login']);
}
}