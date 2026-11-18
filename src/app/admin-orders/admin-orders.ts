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
  protected readonly search = signal('');
  protected readonly page = signal(0);
  protected readonly pageSize = 10;
  protected readonly hasPrev = computed(() => this.page() > 0);
  protected readonly hasNext = signal(false);
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

  protected setSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    this.page.set(0);
    void this.loadOrders();
  }

  protected prevPage(): void {
    if (!this.hasPrev()) return;
    this.page.update((page) => page - 1);
    void this.loadOrders();
  }

  protected nextPage(): void {
    if (!this.hasNext()) return;
    this.page.update((page) => page + 1);
    void this.loadOrders();
  }

  private async loadOrders(): Promise<void> {
    try {
      const result = await firstValueFrom(
        this.ordersApi.list({
          search: this.search(),
          skip: this.page() * this.pageSize,
          take: this.pageSize + 1,
        }),
      );
      this.hasNext.set(result.length > this.pageSize);
      this.orders.set(result.slice(0, this.pageSize));
    } catch (error) {
      console.error('No se pudieron cargar los pedidos', error);
    }
  }
}
