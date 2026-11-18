import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { User } from '../models/user.model';
import { UsersApi } from '../services/users-api';

interface EditErrors {
  email: string;
  general: string;
}

const EMPTY_ERRORS: EditErrors = { email: '', general: '' };
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+$/;

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  cashier: 'Cajero',
  client: 'Cliente',
  'sub-admin': 'Sub Administrador',
};

type UserResponse = { id?: number; role?: string; active?: boolean; name?: string; email?: string };
function toUserModel(u: UserResponse): User {
  return {
    id: u.id ?? 0,
    name: u.name ?? '',
    email: u.email ?? '',
    password: '',
    role: (u.role ?? 'client').toLowerCase() as User['role'],
    active: u.active ?? true,
  };
}

@Component({
  selector: 'app-user-management',
  imports: [FormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagement {
  private readonly usersApi = inject(UsersApi);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly users = signal<User[]>([]);
  protected readonly roleLabels = ROLE_LABELS;

  /** Usuario que se está editando; `null` = modal cerrado. */
  protected readonly editingUser = signal<User | null>(null);
  protected readonly errors = signal<EditErrors>(EMPTY_ERRORS);

  constructor() {
    if (isPlatformBrowser(this.platformId)) void this.loadUsers();
  }

  private async loadUsers(): Promise<void> {
    try {
      const list = await firstValueFrom(this.usersApi.list());
      this.users.set(list.map(toUserModel));
    } catch (error) {
      console.error('No se pudieron cargar usuarios', error);
    }
  }

  protected async toggleStatus(user: User): Promise<void> {
    if (!user.id) return;
    try {
      await firstValueFrom(this.usersApi.updateAdmin(user.id, { active: !user.active }));
      await this.loadUsers();
    } catch (error) {
      console.error('No se pudo actualizar estado', error);
    }
  }

  protected openEdit(user: User): void {
    this.errors.set(EMPTY_ERRORS);
    this.editingUser.set({ ...user });
  }

  protected closeEdit(): void {
    this.editingUser.set(null);
  }

  protected patchEditing<K extends keyof User>(key: K, value: User[K]): void {
    this.editingUser.update((user) => (user ? { ...user, [key]: value } : user));
  }

  protected async saveEdit(): Promise<void> {
    const editing = this.editingUser();
    if (!editing) return;

    this.errors.set(EMPTY_ERRORS);

    if (!editing.name?.trim() || !editing.email?.trim()) {
      this.errors.set({ ...EMPTY_ERRORS, general: 'El nombre y el correo no pueden estar vacíos.' });
      return;
    }

    if (!EMAIL_REGEX.test(editing.email)) {
      this.errors.set({
        ...EMPTY_ERRORS,
        email: 'Correo electrónico inválido. ej: ejemplo@gmail.com',
      });
      return;
    }

    try {
      await firstValueFrom(this.usersApi.updateAdmin(editing.id!, { role: editing.role }));
      this.closeEdit();
      await this.loadUsers();
    } catch (error) {
      console.error('No se pudo actualizar usuario', error);
      this.errors.set({ ...EMPTY_ERRORS, general: 'Error al actualizar usuario.' });
    }
  }
}
