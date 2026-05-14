import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly platformId = inject(PLATFORM_ID);

  // usuarios guardados permanentemente
  private readonly usersStorageKey = 'app_users';

  // sesión actual
  private readonly currentUserKey = 'current_user';

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.ensureDefaultAdmin();
    }
  }

  private ensureDefaultAdmin(): void {
    const users = this.getUsers();
    const adminExists = users.some(
      u => u.email.toLowerCase() === 'admin@gmail.com'
    );

    if (!adminExists) {
      const defaultAdmin: User = {
        id: 1,
        name: 'Administrador',
        email: 'admin@gmail.com',
        password: '123456',
        role: 'admin',
        active: true,
      };

      users.push(defaultAdmin);
      localStorage.setItem(this.usersStorageKey, JSON.stringify(users));
    }
  }

  getUsers(): User[] {
    if (!isPlatformBrowser(this.platformId)) return [];

    const users = localStorage.getItem(this.usersStorageKey);
    return users ? JSON.parse(users) : [];
  }

  addUser(user: User): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const users = this.getUsers();
    user.id = Date.now();
    users.push(user);

    localStorage.setItem(this.usersStorageKey, JSON.stringify(users));
  }

  login(user: User): void {
    if (!isPlatformBrowser(this.platformId)) return;

    sessionStorage.setItem(this.currentUserKey, JSON.stringify(user));
  }

  logout(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    sessionStorage.removeItem(this.currentUserKey);
  }

  getCurrentUser(): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const user = sessionStorage.getItem(this.currentUserKey);
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  updateUserProfile(updatedUser: User): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const users = this.getUsers();

    const updatedUsers = users.map(user => {
      if (
        user.id === updatedUser.id ||
        user.email.toLowerCase() === updatedUser.email.toLowerCase()
      ) {
        return {
          ...user,
          ...updatedUser,
        };
      }
      return user;
    });

    localStorage.setItem(this.usersStorageKey, JSON.stringify(updatedUsers));

    const currentUser = this.getCurrentUser();
    if (
      currentUser &&
      (currentUser.id === updatedUser.id ||
        currentUser.email.toLowerCase() === updatedUser.email.toLowerCase())
    ) {
      sessionStorage.setItem(
        this.currentUserKey,
        JSON.stringify({
          ...currentUser,
          ...updatedUser,
        })
      );
    }
  }

  clearSession(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    sessionStorage.removeItem(this.currentUserKey);
  }
}