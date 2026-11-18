import { CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { ApiOrder, ApiOrderStatus, OrdersApi } from '../services/orders-api';
import { AuthSession } from '../core/auth/auth-session';

const ESTADOS: { value: ApiOrderStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'PAID', label: 'Pagado' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'DELIVERED', label: 'Entregado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

@Component({
  selector: 'app-admin-orders',
  imports: [CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrders implements OnInit {
  private readonly ordersApi = inject(OrdersApi);
  private readonly session = inject(AuthSession);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly estados = ESTADOS;
  protected readonly isAdmin = computed(
    () => (this.session.user()?.role ?? '').toLowerCase() === 'admin',
  );
  protected readonly orders = signal<ApiOrder[]>([]);
  protected readonly totalVentas = computed(() =>
    this.orders()
      .filter((order) => order.status !== 'CANCELLED')
      .reduce((acc, order) => acc + (order.total || 0), 0),
  );

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) void this.loadOrders();
  }

  protected estadoLabel(status: ApiOrderStatus): string {
    return ESTADOS.find((estado) => estado.value === status)?.label ?? status;
  }

  protected async cambiarEstado(order: ApiOrder, event: Event): Promise<void> {
    const status = (event.target as HTMLSelectElement).value as ApiOrderStatus;
    if (status === order.status) return;

    try {
      const updated = await firstValueFrom(this.ordersApi.update(order.id, { status }));
      this.orders.update((orders) =>
        orders.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch {
      await this.loadOrders();
    }
  }

  private async loadOrders(): Promise<void> {
    try {
      this.orders.set(await firstValueFrom(this.ordersApi.list()));
    } catch (error) {
      console.error('No se pudieron cargar los pedidos', error);
    }
  }
}
