import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { OrdersApi, ApiOrder } from '../services/orders-api';
import { ProductsApi, ApiProduct } from '../services/products-api';
import { UsersApi } from '../services/users-api';
import { AuthSession } from '../core/auth/auth-session';
import { normalizeRole } from '../core/auth/auth-api';

interface ChartPoint {
  label: string;
  value: number;
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function dayKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function buildSalesByDay(orders: ApiOrder[]): ChartPoint[] {
  const totals = new Map<string, number>();

  for (const order of orders) {
    const date = new Date(order.date);
    if (Number.isNaN(date.getTime())) continue;
    const key = dayKey(date);
    totals.set(key, (totals.get(key) ?? 0) + (order.total || 0));
  }

  const points: ChartPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    points.push({
      label: WEEKDAYS[date.getDay()],
      value: totals.get(dayKey(date)) ?? 0,
    });
  }

  return points;
}

function buildStockByCategory(products: ApiProduct[]): ChartPoint[] {
  const totals = new Map<string, number>();

  for (const product of products) {
    const category = product.category?.trim() || 'Sin categoría';
    totals.set(category, (totals.get(category) ?? 0) + (product.stock || 0));
  }

  return [...totals.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  imports: [CommonModule],
  styleUrls: ['./admin.css'],
})
export class Admin implements OnInit {
  private readonly ordersApi = inject(OrdersApi);
  private readonly productsApi = inject(ProductsApi);
  private readonly usersApi = inject(UsersApi);
  private readonly session = inject(AuthSession);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly totalClientes = signal(0);
  protected readonly totalProductos = signal(0);
  protected readonly totalRecaudo = signal(0);
  protected readonly ventasSemana = signal<ChartPoint[]>([]);
  protected readonly stockCategorias = signal<ChartPoint[]>([]);

  protected readonly maxVenta = computed(() =>
    Math.max(1, ...this.ventasSemana().map((point) => point.value)),
  );
  protected readonly maxStock = computed(() =>
    Math.max(1, ...this.stockCategorias().map((point) => point.value)),
  );

  private get isAdmin(): boolean {
    return normalizeRole(this.session.user()?.role) === 'admin';
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) void this.calculateStats();
  }

  private async calculateStats(): Promise<void> {
    await Promise.all([
      this.loadOrders(),
      this.loadProducts(),
      this.loadClients(),
    ]);
  }

  private async loadOrders(): Promise<void> {
    try {
      const orders = await firstValueFrom(this.ordersApi.list());
      this.totalRecaudo.set(
        orders
          .filter((order) => order.status !== 'CANCELLED')
          .reduce((acc, order) => acc + (order.total || 0), 0),
      );
      this.ventasSemana.set(buildSalesByDay(orders));
    } catch (error) {
      console.error('No se pudo calcular el recaudo', error);
    }
  }

  private async loadProducts(): Promise<void> {
    try {
      const products = await firstValueFrom(this.productsApi.list());
      this.totalProductos.set(products.length);
      this.stockCategorias.set(buildStockByCategory(products));
    } catch (error) {
      console.error('No se pudieron contar los productos', error);
    }
  }

  private async loadClients(): Promise<void> {
    if (!this.isAdmin) return;
    try {
      const users = await firstValueFrom(this.usersApi.list());
      this.totalClientes.set(users.length);
    } catch (error) {
      console.error('No se pudieron contar los clientes', error);
    }
  }
}
