import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { Product } from '../models/product.model';
import { CartService } from '../services/cart.service';
import { UserService } from '../services/user.service';

interface CategorySection {
  category: string;
  slug: string;
  carouselId: string;
  items: Product[];
  /** Con pocos productos se centran; con muchos se muestran flechas de carrusel. */
  carousel: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Component({
  selector: 'app-product-car',
  templateUrl: './product-car.html',
  styleUrl: './product-car.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:resize)': 'updateViewportMode()',
    '(window:orientationchange)': 'updateViewportMode()',
  },
})
export class ProductCar implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly products = input<Product[]>([]);

  protected readonly showLoginAlert = signal(false);
  protected readonly isMobileViewport = signal(false);

  /** Claves de los productos que acaban de agregarse (efecto visual de 500 ms). */
  protected readonly justAdded = signal<ReadonlySet<number | string>>(new Set());

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly isAdminView = computed(() =>
    this.currentUrl().includes('admin-dashboard/dashBoard'),
  );

  protected readonly sections = computed<CategorySection[]>(() => {
    const products = this.products();
    const mobile = this.isMobileViewport();

    const categories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    );

    return categories.map((category) => {
      const key = category.toLowerCase().trim();
      const items = products.filter((p) => p.category?.toLowerCase().trim() === key);
      const slug = slugify(category);

      return {
        category,
        slug,
        carouselId: `carousel-${slug}`,
        items,
        carousel: mobile ? items.length >= 2 : items.length >= 4,
      };
    });
  });

  ngOnInit(): void {
    this.updateViewportMode();
  }

  protected updateViewportMode(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const matches = this.document.defaultView?.matchMedia('(max-width: 768px)').matches ?? false;
    this.isMobileViewport.set(matches);
  }

  protected addToCart(product: Product): void {
    if (this.isAdminView()) return;

    if (!this.userService.isLoggedIn()) {
      this.showLoginAlert.set(true);
      return;
    }

    this.flashAdded(product);
    this.cartService.addToCart(product);
  }

  protected closeLoginAlert(): void {
    this.showLoginAlert.set(false);
  }

  protected goToLogin(): void {
    this.showLoginAlert.set(false);
    this.router.navigate(['/login']);
  }

  protected scrollCategory(carouselId: string, amount: number): void {
    this.document.getElementById(carouselId)?.scrollBy({ left: amount, behavior: 'smooth' });
  }

  private flashAdded(product: Product): void {
    const key = product.id ?? product.name;

    this.justAdded.update((keys) => new Set(keys).add(key));

    setTimeout(() => {
      this.justAdded.update((keys) => {
        const next = new Set(keys);
        next.delete(key);
        return next;
      });
    }, 500);
  }
}