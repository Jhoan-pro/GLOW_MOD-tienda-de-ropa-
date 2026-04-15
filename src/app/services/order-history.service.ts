import { Injectable } from '@angular/core';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {

  constructor(private userService: UserService) {}
  
  private getStorageKey(): string {
    const user = this.userService.getCurrentUser();
    return user ? `orderHistory_${user.email}` : 'orderHistory_guest';
  }

  getHistory(): any[] {
    const data = localStorage.getItem(this.getStorageKey());
    return data ? JSON.parse(data) : [];
  }

  addOrder(order: any) {
    const history = this.getHistory();
    history.push(order);
    localStorage.setItem(this.getStorageKey(), JSON.stringify(history));
  }

  clearHistory() {
    localStorage.removeItem(this.getStorageKey());
  }
}