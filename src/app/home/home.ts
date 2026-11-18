import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProductCar } from '../product-cart/product-car';
import { Product } from '../models/product.model';
import { ProductsApi, ApiProduct } from '../services/products-api';
import { CatalogSearch } from '../services/catalog-search';

function toProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    ownerId: p.ownerId ?? undefined,
    name: p.name,
    price: p.price,
    stock: p.stock,
    category: p.category,
    description: p.description,
    image: p.image ?? undefined,
  };
}

@Component({
  selector: 'app-home',
  imports: [ProductCar],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private readonly document = inject(DOCUMENT);
  private readonly productsApi = inject(ProductsApi);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly catalogSearch = inject(CatalogSearch);

  private readonly allProducts = signal<Product[]>([]);
  protected readonly products = computed(() => {
    const query = this.catalogSearch.query().trim().toLowerCase();
    if (!query) return this.allProducts();

    return this.allProducts().filter((product) =>
      [product.name, product.category, product.description].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) void this.loadProducts();
  }

  private async loadProducts(): Promise<void> {
    try {
      const list = await firstValueFrom(this.productsApi.list());
      this.allProducts.set(list.map(toProduct));
    } catch (error) {
      console.error('No se pudo cargar el catálogo', error);
    }
  }

  protected irCatalogo(): void {
    this.document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
  }
}
