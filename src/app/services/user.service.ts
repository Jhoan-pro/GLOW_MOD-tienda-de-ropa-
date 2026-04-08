import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private storageKey = 'app_users';

  getUsers(): User[] {
    const users = localStorage.getItem(this.storageKey);
    return users ? JSON.parse(users) : [];
  }

  addUser(user: User) {
    const users = this.getUsers();
    user.id = Date.now(); // ID simple
    users.push(user);
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }
}