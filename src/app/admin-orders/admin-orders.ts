import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OrderHistoryService } from '../services/order-history.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-admin-orders',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrders {
  private readonly orderService = inject(OrderHistoryService);
  private readonly currentUser = inject(UserService).currentUser();

  protected readonly orders =
    this.currentUser?.role === 'sub-admin' && this.currentUser.id
      ? this.orderService.getOrdersByOwner(this.currentUser.id)
      : this.orderService.getAllOrdersForAdmin();

  protected readonly totalVentas = this.orders.reduce((acc, order) => acc + (order.total || 0), 0);
}
