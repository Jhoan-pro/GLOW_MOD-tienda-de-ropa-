import { Injectable } from '@angular/core';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
  constructor(private userService: UserService) {}
  
  // Llave del usuario
  private getPersonalKey(): string {
    const user = this.userService.getCurrentUser();
    return user ? `orderHistory_${user.email}` : 'orderHistory_guest';
  }

  // Llave  para el Administrador
  private readonly ADMIN_KEY = 'all_orders_global';


  addOrder(order: any) {
    //  Guardar en su historial personal
    const personalHistory = this.getHistory();
    personalHistory.push(order);
    localStorage.setItem(this.getPersonalKey(), JSON.stringify(personalHistory));

    // Guardar en el historial de administrador
    const globalHistory = this.getAllOrdersForAdmin();
    globalHistory.push(order);
    localStorage.setItem(this.ADMIN_KEY, JSON.stringify(globalHistory));
  }

  // Historial de cliente
  getHistory(): any[] {
    const data = localStorage.getItem(this.getPersonalKey());
    return data ? JSON.parse(data) : [];
  }

  // Historial admin (todos los pedidos)
  getAllOrdersForAdmin(): any[] {
    const data = localStorage.getItem(this.ADMIN_KEY);
    return data ? JSON.parse(data) : [];
  }
}