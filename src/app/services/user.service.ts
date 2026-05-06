import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { User } from '../models/user.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor() {
  if (isPlatformBrowser(this.platformid)) {
    this.ensureDefaultAdmin();
  }
}

private ensureDefaultAdmin() {
  const users = this.getUsers();
  const adminExists = users.some(u => u.email === 'admin@gmail.com');

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
  // usuarios
  private usersStorageKey = 'app_users';

  // sesión
  private currentUserKey = 'current_user';

  private platformid = inject(PLATFORM_ID);


  getUsers(): User[] {
    if (isPlatformBrowser(this.platformid)) {
      const users = localStorage.getItem(this.usersStorageKey);
      return users ? JSON.parse(users) : [];
    }
    return [];
  }

  addUser(user: User) {
    if (isPlatformBrowser(this.platformid)) {
      const users = this.getUsers();

      user.id = Date.now();

      users.push(user);

      localStorage.setItem(
        this.usersStorageKey,
        JSON.stringify(users)
      );
    }
  }


  login(user: User) {
    if (isPlatformBrowser(this.platformid)) {
      localStorage.setItem(
        this.currentUserKey,
        JSON.stringify(user)
      );
    }
  }


  logout() {
    if (isPlatformBrowser(this.platformid)) {
      localStorage.removeItem(this.currentUserKey);
    }
  }


  getCurrentUser(): User | null {
    if (isPlatformBrowser(this.platformid)) {

      const user = localStorage.getItem(this.currentUserKey);

      return user
        ? JSON.parse(user)
        : null;
    }

    return null;
  }


  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }


  updateUserProfile(updatedUser: User) {

    if (!isPlatformBrowser(this.platformid)) return;

    const users = this.getUsers();

    const updatedUsers = users.map(user => {

      if (
        user.id === updatedUser.id ||
        user.email === updatedUser.email
      ) {
        return {
          ...user,
          ...updatedUser
        };
      }

      return user;
    });

    localStorage.setItem(
      this.usersStorageKey,
      JSON.stringify(updatedUsers)
    );

    localStorage.setItem(
      this.currentUserKey,
      JSON.stringify(updatedUser)
    );
  }

}