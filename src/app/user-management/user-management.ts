import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';

interface EditErrors {
  email: string;
  general: string;
}

const EMPTY_ERRORS: EditErrors = { email: '', general: '' };
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_LABELS: Record<User['role'], string> = {
  admin: 'Administrador',
  cashier: 'Cajero',
  client: 'Cliente',
  'sub-admin': 'Sub Administrador',
};

@Component({
  selector: 'app-user-management',
  imports: [FormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagement {
  private readonly userService = inject(UserService);

  protected readonly users = this.userService.users;
  protected readonly roleLabels = ROLE_LABELS;

  /** Usuario que se está editando; `null` = modal cerrado. */
  protected readonly editingUser = signal<User | null>(null);
  protected readonly errors = signal<EditErrors>(EMPTY_ERRORS);

  protected toggleStatus(user: User): void {
    this.userService.setUsers(
      this.users().map((u) => (u === user ? { ...u, active: !u.active } : u)),
    );
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

  protected saveEdit(): void {
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

    const allUsers = this.users();

    const emailExiste = allUsers.some(
      (u) => u.email.toLowerCase() === editing.email.toLowerCase() && u.id !== editing.id,
    );

    if (emailExiste) {
      this.errors.set({ ...EMPTY_ERRORS, email: 'Este correo ya está en uso por otro usuario.' });
      return;
    }

    if (!allUsers.some((u) => u.id === editing.id)) return;

    this.userService.setUsers(allUsers.map((u) => (u.id === editing.id ? editing : u)));
    this.closeEdit();
  }
}