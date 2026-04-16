import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../models/product.model';
import { CartService } from '../services/cart.service';
import { UserService } from '../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { FilterService } from '../services/filter.service';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
@Component({
  selector: 'app-product-car',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-car.html',
  styleUrls: ['./product-car.css']
})
export class ProductCar {
  showLoginAlert = false;
  @Input() products: Product[] = [];
  filteredProducts: Product[] = [];

  constructor(
    private cartService: CartService,
    private userService: UserService,
    private filterService: FilterService,
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
  addToCart(product: Product) {
    if (!this.userService.isLoggedIn()) {
      this.showLoginAlert = true;
      return;
    }

    if (product.stock <= 0) return;

    product.added = true;

    setTimeout(() => {
      product.added = false;
    }, 500);

    this.cartService.addToCart(product);
  }

  get categories(): string[] {
    return [...new Set(this.products.map(p => p.category).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );
  }

  getProductsByCategory(category: string) {
    return this.products.filter(
      p => p.category.toLowerCase().trim() === category.toLowerCase().trim()
    );
  }


  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const storedProducts = localStorage.getItem('products');

      if (storedProducts) {
        this.products = JSON.parse(storedProducts);
      }
    }

    this.applyFilter();

    this.route.params.subscribe(() => {
      this.applyFilter();
    });

    if (isPlatformBrowser(this.platformId)) {
      this.router.events.subscribe(() => {
        const storedProducts = localStorage.getItem('products');

        if (storedProducts) {
          this.products = JSON.parse(storedProducts);
          this.applyFilter();
        }
      });
    }
  }

  ngOnChanges() {
    this.applyFilter();
  }

  applyFilter() {
    const category = this.route.snapshot.params['nombre'];

    if (!category) {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(
        p => p.category.toLowerCase().trim() === category.toLowerCase().trim()
      );
    }
  }
}