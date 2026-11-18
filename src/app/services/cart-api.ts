import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';
import { API_BASE_URL } from '../core/auth/api-config';
import { ApiProduct } from './products-api';

export interface ApiCartItem {
  productId: number;
  cantidad: number;
  product: ApiProduct;
}

export interface ApiCart {
  items: ApiCartItem[];
  lastActivity: string | null;
}

@Injectable({ providedIn: 'root' })
export class CartApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  get() {
    return this.http.get<ApiCart>(`${this.base}/cart`).pipe(timeout(10_000));
  }

  upsert(productId: number, cantidad: number) {
    return this.http
      .put<ApiCart>(`${this.base}/cart/items/${productId}`, { cantidad })
      .pipe(timeout(10_000));
  }

  remove(productId: number) {
    return this.http.delete<void>(`${this.base}/cart/items/${productId}`).pipe(timeout(10_000));
  }

  clear() {
    return this.http.delete<void>(`${this.base}/cart`).pipe(timeout(10_000));
  }
}
