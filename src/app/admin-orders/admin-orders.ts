import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderHistoryService } from '../services/order-history.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
})
export class AdminOrders implements OnInit {
  orders: any[] = [];
  totalVentas: number = 0;

  constructor(
    private orderService: OrderHistoryService,
    private userService: UserService,
  ) {}

  ngOnInit() {
    const currentUser = this.userService.getCurrentUser();
    const isSubAdmin = currentUser?.role === 'sub-admin';

    if (isSubAdmin && currentUser?.id) {
      this.orders = this.orderService.getOrdersByOwner(currentUser.id);
    } else {
      this.orders = this.orderService.getAllOrdersForAdmin();
    }

    this.calculateTotal();
  }

  calculateTotal() {
    this.totalVentas = this.orders.reduce((acc, order) => acc + (order.total || 0), 0);
  }

  viewOrderDetails(order: any) {
    console.log('Detalles del pedido:', order);
  }

  getStatusClass(status: string) {
    return {
      'status-completed': status === 'Completado',
      'status-pending': status === 'Pendiente',
      'status-cancelled': status === 'Cancelado',
    };
  }
}