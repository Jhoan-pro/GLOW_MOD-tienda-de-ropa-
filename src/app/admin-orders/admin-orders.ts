import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderHistoryService } from '../services/order-history.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css'
})
export class AdminOrders implements OnInit {
  orders: any[] = [];
  totalVentas: number = 0;

  constructor(private orderService: OrderHistoryService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orders = this.orderService.getAllOrdersForAdmin();
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalVentas = this.orders.reduce((acc, order) => acc + (order.total || 0), 0);
  }

  // Para ver detalles de un pedido específico
  viewOrderDetails(order: any) {
    console.log('Detalles del pedido:', order);
    // Aquí podrías abrir un modal similar al de "Ver Producto"
  }

  getStatusClass(status: string) {
    return {
      'status-completed': status === 'Completado',
      'status-pending': status === 'Pendiente',
      'status-cancelled': status === 'Cancelado'
    };
  }
}