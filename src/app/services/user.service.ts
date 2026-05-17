import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../models/user.model';

interface SessionLock {
  tabId: string;
  email: string;
  startedAt: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly usersStorageKey = 'app_users';
  private readonly currentUserKey = 'current_user';
  private readonly sessionLockKey = 'app_session_lock';

  // Canal para detectar pestañas duplicadas
  private readonly tabChannelName = 'auth-tab-channel';

  // Identificador único de esta pestaña/instancia JS
  private readonly runtimeId = this.createRuntimeId();

  private readonly lockTimeoutMs = 12 * 60 * 60 * 1000; // 12 horas
  private tabChannel: BroadcastChannel | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.ensureDefaultAdmin();
      this.initCrossTabProtection();
      this.cleanupExpiredLock();

      window.addEventListener('beforeunload', this.handleBeforeUnload);
      window.addEventListener('pagehide', this.handleBeforeUnload);
    }
  }

  private createRuntimeId(): string {
    return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  }

  private handleBeforeUnload = (): void => {
    this.releaseSessionLockIfOwner();
  };

  private initCrossTabProtection(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof BroadcastChannel === 'undefined') return;
    if (this.tabChannel) return;

    this.tabChannel = new BroadcastChannel(this.tabChannelName);

    this.tabChannel.onmessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.sender === this.runtimeId) return;

      // Otra pestaña pregunta si existe una sesión activa
      if (data.type === 'PING_SESSION') {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          this.tabChannel?.postMessage({
            type: 'PONG_SESSION',
            sender: this.runtimeId,
            target: data.sender,
          });
        }
      }

      // Esta pestaña recibió respuesta: es una copia/clone
      if (data.type === 'PONG_SESSION' && data.target === this.runtimeId) {
        this.clearSession();
        window.location.replace('/login');
      }
    };

    // Si esta pestaña ya venía con sesión, pregunta si hay otra pestaña viva
    if (this.getCurrentUser()) {
      setTimeout(() => this.pingOtherTabs(), 0);
    }
  }

  private pingOtherTabs(): void {
    if (!this.tabChannel || !isPlatformBrowser(this.platformId)) return;

    this.tabChannel.postMessage({
      type: 'PING_SESSION',
      sender: this.runtimeId,
    });
  }

  private getSessionLock(): SessionLock | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const raw = localStorage.getItem(this.sessionLockKey);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as SessionLock;
    } catch {
      localStorage.removeItem(this.sessionLockKey);
      return null;
    }
  }

  private cleanupExpiredLock(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const lock = this.getSessionLock();
    if (!lock) return;

    if (Date.now() - lock.startedAt > this.lockTimeoutMs) {
      localStorage.removeItem(this.sessionLockKey);
    }
  }

  private releaseSessionLockIfOwner(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const lock = this.getSessionLock();
    if (lock && lock.tabId === this.runtimeId) {
      localStorage.removeItem(this.sessionLockKey);
    }
  }

  private ensureDefaultAdmin(): void {
    const users = this.getUsers();
    const adminExists = users.some(
      (u) => u.email.toLowerCase() === 'admin@gmail.com'
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

  /**
   * Devuelve false si ya existe otra sesión activa en este dispositivo.
   */
  login(user: User): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    this.cleanupExpiredLock();

    const currentLock = this.getSessionLock();

    // Ya existe una sesión activa
    if (currentLock) {
      return false;
    }

    sessionStorage.setItem(this.currentUserKey, JSON.stringify(user));

    const newLock: SessionLock = {
      tabId: this.runtimeId,
      email: user.email,
      startedAt: Date.now(),
    };

    localStorage.setItem(this.sessionLockKey, JSON.stringify(newLock));

    // Avisa a otras pestañas
    this.pingOtherTabs();

    return true;
  }

  logout(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    sessionStorage.removeItem(this.currentUserKey);
    this.releaseSessionLockIfOwner();
  }

  getCurrentUser(): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const user = sessionStorage.getItem(this.currentUserKey);
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasActiveSessionGlobal(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    this.cleanupExpiredLock();
    return this.getSessionLock() !== null;
  }

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
    this.releaseSessionLockIfOwner();
  }
}