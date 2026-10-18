import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProductCar } from '../product-cart/product-car';
import { ProductService } from '../services/product';

@Component({
  selector: 'app-home',
  imports: [ProductCar],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly document = inject(DOCUMENT);

  protected readonly products = inject(ProductService).products;

  protected irCatalogo(): void {
    this.document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
  }
}
