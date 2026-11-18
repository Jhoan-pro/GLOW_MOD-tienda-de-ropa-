import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { timeout } from 'rxjs';
import { API_BASE_URL } from '../core/auth/api-config';

export interface ApiProduct {
  id: number;
  ownerId: number | null;
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  image: string | null;
}

export interface ProductInput {
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  image?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  // GET /api/products[?ownerId=]
  list(ownerId?: number) {
    let params = new HttpParams();
    if (ownerId !== undefined) params = params.set('ownerId', ownerId);
    return this.http.get<ApiProduct[]>(`${this.base}/products`, { params }).pipe(timeout(10_000));
  }

  // POST /api/products — admin/sub-admin. `ownerId` lo deriva el servidor.
  create(product: ProductInput) {
    return this.http.post<ApiProduct>(`${this.base}/products`, product).pipe(timeout(10_000));
  }

  // PATCH /api/products/:id — admin/sub-admin (sub-admin solo los propios).
  update(id: number, product: ProductInput) {
    return this.http.patch<ApiProduct>(`${this.base}/products/${id}`, product).pipe(timeout(10_000));
  }

  // DELETE /api/products/:id — admin/sub-admin.
  remove(id: number) {
    return this.http.delete<void>(`${this.base}/products/${id}`).pipe(timeout(10_000));
  }
}
