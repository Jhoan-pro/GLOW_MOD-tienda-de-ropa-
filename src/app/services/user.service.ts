import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.ensureDefaultAdmin();
    }
  }

  private ensureDefaultAdmin(): void {
    const users = this.getUsers();
    const adminExists = users.some((u) => u.email.toLowerCase() === 'admin@gmail.com');

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
  private readonly platformId = inject(PLATFORM_ID);

  // usuarios guardados permanentemente
  private readonly usersStorageKey = 'app_users';

  // sesión actual
  private readonly currentUserKey = 'current_user';

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
    //se cambio de localStorage a sessionStorage para que la sesion
    // se mantenga solo mientras el navegador este abierto, asi al cerrar el navegador se cierra la sesion automaticamente, lo cual es mas seguro y adecuado
    const user = sessionStorage.getItem(this.currentUserKey);
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }
  //metodo para actualizar el perfil de usuario
  updateUserProfile(updatedUser: User): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const users = this.getUsers();

    const updatedUsers = users.map((user) => {
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
    //Guardamos los usuarios actualizados en el localStorage
    localStorage.setItem(this.usersStorageKey, JSON.stringify(updatedUsers));

    const currentUser = this.getCurrentUser();
    if (
      currentUser &&
      (currentUser.id === updatedUser.id ||
        currentUser.email.toLowerCase() === updatedUser.email.toLowerCase())
    ) {
      //si el usuario actualizado es el mismo que el de la sesion actual, esto actualiza la sesion con los datos nuevos
      //para que los cambios se reflejen inmediatamente sin necesida de cerrae sesion y volver a iniciar sesion
      sessionStorage.setItem(
        this.currentUserKey,

        JSON.stringify({
          //si el usuario actualizado no tiene un campo, se mantiene el valor actual de ese campo en la sesion
          //asi evitamos que los datos se pierdan
          ...currentUser,

          ...updatedUser,
        }),
      );
    }
  }
  //aqui el metodo para limpiar la sesion, aunque logout ya hace eso,
  //este metodo se puede usar para limpiar cualquier dato adicional que se quiera eliminar al cerrar sesion
  clearSession(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    sessionStorage.removeItem(this.currentUserKey);
  }
  //el otro cambio que puedes ver esta en el navbar, donde se llama a este metodo clearSession() al confirmar el logout, asi nos aseguramos de limpiar toda la sesion correctamente, incluyendo cualquier dato adicional que se quiera eliminar al cerrar sesion, como el carrito de compras en este caso
}
