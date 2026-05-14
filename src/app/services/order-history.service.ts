import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class OrderHistoryService {
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private userService: UserService) {}

  private readonly ADMIN_KEY = 'all_orders_global';

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Llave del usuario
  private getPersonalKey(): string {
    const user = this.userService.getCurrentUser();
    return user ? `orderHistory_${user.email}` : 'orderHistory_guest';
  }

  addOrder(order: any) {
    if (!this.isBrowser()) return;

    const personalHistory = this.getHistory();
    personalHistory.push(order);
    localStorage.setItem(this.getPersonalKey(), JSON.stringify(personalHistory));

    const globalHistory = this.getAllOrdersForAdmin();
    globalHistory.push(order);
    localStorage.setItem(this.ADMIN_KEY, JSON.stringify(globalHistory));
  }

  // Historial de cliente
  getHistory(): any[] {
    if (!this.isBrowser()) return [];

    const data = localStorage.getItem(this.getPersonalKey());
    return data ? JSON.parse(data) : [];
  }

  // Historial admin (todos los pedidos)
  getAllOrdersForAdmin(): any[] {
    if (!this.isBrowser()) return [];

    const data = localStorage.getItem(this.ADMIN_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Filtra pedidos que contengan productos del sub-admin
  getOrdersByOwner(ownerId: number): any[] {
    return this.getAllOrdersForAdmin().filter((order) =>
      order.items?.some((item: any) => item.ownerId === ownerId),
    );
  }
}