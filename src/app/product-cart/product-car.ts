import { Component, Input, OnChanges, OnInit, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../models/product.model';
import { CartService } from '../services/cart.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-car',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-car.html',
  styleUrls: ['./product-car.css'],
})
export class ProductCar implements OnInit, OnChanges {
  showLoginAlert = false;
  isAdminView = false;
  isMobileViewport = false;

  @Input() products: Product[] = [];

  constructor(
    private cartService: CartService,
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.checkCurrentRoute();
    this.updateViewportMode();
  }

  ngOnChanges(_: SimpleChanges) {
    this.checkCurrentRoute();
    this.updateViewportMode();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateViewportMode();
  }

  @HostListener('window:orientationchange')
  onOrientationChange() {
    this.updateViewportMode();
  }

  private updateViewportMode() {
    if (typeof window === 'undefined') return;
    this.isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
  }

  shouldEnableCarousel(category: string): boolean {
    const total = this.getProductsByCategory(category).length;
    return this.isMobileViewport ? total >= 2 : total >= 4;
  }

  shouldCenterProducts(category: string): boolean {
    const total = this.getProductsByCategory(category).length;
    return this.isMobileViewport ? total < 2 : total < 4;
  }

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

  get categories(): string[] {
    return [...new Set(this.products.map((p) => p.category).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    );
  }

  getProductsByCategory(category: string) {
    return this.products.filter(
      (p) => p.category?.toLowerCase().trim() === category.toLowerCase().trim(),
    );
  }

  addToCart(product: Product) {
    if (this.isAdminView) return;

    if (!this.userService.isLoggedIn()) {
      this.showLoginAlert = true;
      return;
    }

    product.added = true;
    setTimeout(() => (product.added = false), 500);

    this.cartService.addToCart(product);
  }

  closeLoginAlert() {
    this.showLoginAlert = false;
  }

  goToLogin() {
    this.showLoginAlert = false;
    this.router.navigate(['/login']);
  }

  carouselId(category: string): string {
    return `carousel-${this.slugify(category)}`;
  }

  scrollCategory(category: string, amount: number) {
    const container = document.getElementById(this.carouselId(category));

    if (container) {
      container.scrollBy({
        left: amount,
        behavior: 'smooth',
      });
    }
  }
}