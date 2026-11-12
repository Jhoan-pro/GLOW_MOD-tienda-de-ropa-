import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';
import { API_BASE_URL } from '../core/auth/api-config';

export type ApiPaymentMethod = 'card' | 'transfer' | 'wallet';

/**
 * Mirrors CreateOrderDto on the backend.
 * `cashierId`, `total` and `invoiceNumber` are deliberately absent: the server
 * derives all three, and sending them is ignored.
 */
export interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerDocumentId: string;
  notes?: string;
  paymentMethod: ApiPaymentMethod;
  // card
  cardName?: string;
  cardNumberLast4?: string;
  // transfer
  bank?: string;
  reference?: string;
  // wallet
  walletNumber?: string;
  items: { productId: number; quantity: number }[];
}

export interface ApiOrderItem {
  id: number;
  productId: number | null;
  ownerId: number | null;
  name: string;
  quantity: number;
  price: number;
}

export interface ApiOrder {
  id: number;
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerDocumentId: string;
  notes: string | null;
  cashierId: number;
  paymentMethod: string;
  total: number;
  items: ApiOrderItem[];
}

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  // POST /api/orders — 201 on success, 409 when stock is insufficient.
  create(order: CreateOrderRequest) {
    return this.http.post<ApiOrder>(`${this.base}/orders`, order).pipe(timeout(15_000));
  }

  list() {
    return this.http.get<ApiOrder[]>(`${this.base}/orders`).pipe(timeout(10_000));
  }

  findOne(id: number) {
    return this.http.get<ApiOrder>(`${this.base}/orders/${id}`).pipe(timeout(10_000));
  }

  // Only an admin may patch (notes only) or delete.
  updateNotes(id: number, notes: string) {
    return this.http.patch<ApiOrder>(`${this.base}/orders/${id}`, { notes }).pipe(timeout(10_000));
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.base}/orders/${id}`).pipe(timeout(10_000));
  }
}
