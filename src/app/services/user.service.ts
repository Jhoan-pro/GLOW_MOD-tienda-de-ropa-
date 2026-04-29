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
      user.id = Date.now();
      users.push(user);
      localStorage.setItem(this.storageKey, JSON.stringify(users));
      console.log('usuario guardado')
    }
    return [];
  }
  private currentUserKey = 'current_user';

// Guardar usuario logueado
login(user: User) {
  if (isPlatformBrowser(this.platformid)) {
    localStorage.setItem(this.currentUserKey, JSON.stringify(user));
  }
}

// Cerrar sesión
logout() {
  if (isPlatformBrowser(this.platformid)) {
    localStorage.removeItem(this.currentUserKey);
  }
}

// Obtener usuario actual
getCurrentUser(): User | null {
  if (isPlatformBrowser(this.platformid)) {
    const user = localStorage.getItem(this.currentUserKey);
    return user ? JSON.parse(user) : null;
  }
  return null;
}


// Saber si está logueado
isLoggedIn(): boolean {
  return this.getCurrentUser() !== null;
}
updateUserProfile(updatedUser: User) {
  if (!isPlatformBrowser(this.platformid)) return;

  const users = this.getUsers();

  const updatedUsers = users.map((user) => {
    if (user.id === updatedUser.id || user.email === updatedUser.email) {
      return { ...user, ...updatedUser };
    }
    return user;
  });

  localStorage.setItem(this.storageKey, JSON.stringify(updatedUsers));
  localStorage.setItem(this.currentUserKey, JSON.stringify(updatedUser));
}
}
