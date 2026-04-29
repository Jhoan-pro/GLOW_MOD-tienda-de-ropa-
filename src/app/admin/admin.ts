import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { ProductService } from '../services/product';
import { CommonModule } from '@angular/common';
import { OrderHistoryService } from '../services/order-history.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  imports: [CommonModule],
  styleUrls: ['./admin.css'],
})
export class Admin implements OnInit {
  orders: any[] = [];
  totalClientes: number = 0;
  totalProductos: number = 0;
  totalRecaudo: number = 0;

  constructor(
    private userService: UserService,
    private productService: ProductService,
    private orderService: OrderHistoryService,
  ) {}

  ngOnInit() {
    this.calculateStats();
  }

  calculateStats() {
    // 1. Obtener total de clientes
    this.totalClientes = this.userService.getUsers().length;

    // 2. Obtener total de productos
    this.totalProductos = this.productService.getProducts().length;


    // 3. Calcular recaudo total
    this.orders = this.orderService.getAllOrdersForAdmin();
    this.totalRecaudo = this.orders.reduce((acc, order) => acc + (order.total || 0), 0);
  }
}
