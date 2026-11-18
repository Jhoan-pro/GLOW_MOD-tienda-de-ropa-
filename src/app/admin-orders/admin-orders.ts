import { CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiOrder, OrdersApi } from '../services/orders-api';

@Component({
  selector: 'app-admin-orders',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrders implements OnInit {
  private readonly ordersApi = inject(OrdersApi);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly orders = signal<ApiOrder[]>([]);
  protected readonly totalVentas = computed(() =>
    this.orders().reduce((acc, order) => acc + (order.total || 0), 0),
  );

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) void this.loadOrders();
  }

  private async loadOrders(): Promise<void> {
    try {
      this.orders.set(await firstValueFrom(this.ordersApi.list()));
    } catch (error) {
      console.error('No se pudieron cargar los pedidos', error);
    }
  }
}
