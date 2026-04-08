import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { inject, PLATFORM_ID } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private storageKey = 'app_users';
  private platformid = inject(PLATFORM_ID);

  getUsers(): User[] {
    if (isPlatformBrowser(this.platformid)) {
      const users = localStorage.getItem(this.storageKey);
      return users ? JSON.parse(users) : [];
    }
    return [];
  }

  addUser(user: User) {
    if (isPlatformBrowser(this.platformid)) {
      const users = this.getUsers();
      user.id = Date.now(); // ID simple
      users.push(user);
      localStorage.setItem(this.storageKey, JSON.stringify(users));
    }
    return [];
  }
}
