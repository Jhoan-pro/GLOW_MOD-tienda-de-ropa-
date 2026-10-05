import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UsersApi } from '../services/users-api';
import { apiErrorMessage } from '../core/auth/api-error';

interface RegisterErrors {
  email: string;
  password: string;
  confirmPassword: string;
  general: string;
}

const EMPTY_ERRORS: RegisterErrors = {
  email: '',
  password: '',
  confirmPassword: '',
  general: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-register-user',
  imports: [FormsModule, RouterLink],
  templateUrl: './register-user.html',
  styleUrl: './register-user.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterUser {
  private readonly router = inject(Router);
  private readonly usersApi = inject(UsersApi);

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly errors = signal<RegisterErrors>(EMPTY_ERRORS);
  protected readonly successMsg = signal('');
  protected readonly loading = signal(false);

  protected async register(): Promise<void> {
    this.errors.set(EMPTY_ERRORS);
    this.successMsg.set('');

    const name = this.name().trim();
    const email = this.email().trim();
    const password = this.password();
    const confirmPassword = this.confirmPassword();

    // Todos vacíos
    if (!name && !email && !password && !confirmPassword) {
      this.errors.set({ ...EMPTY_ERRORS, general: 'Todos los campos son obligatorios' });
      return;
    }

    const errors: RegisterErrors = { ...EMPTY_ERRORS };

    if (!name) errors.general = 'El nombre es obligatorio';
    if (!email) errors.email = 'El correo es obligatorio';
    if (!password) errors.password = 'La contraseña es obligatoria';
    if (!confirmPassword) errors.confirmPassword = 'Debes confirmar la contraseña';

    if (email && !EMAIL_REGEX.test(email)) {
      errors.email = 'Correo inválido. Ej: ejemplo@gmail.com';
    }

    if (password && password.length < 6) {
      errors.password = 'La contraseña debe tener mínimo 6 caracteres';
    }

    if (password && confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (errors.email || errors.password || errors.confirmPassword || errors.general) {
      this.errors.set(errors);
      return;
    }

    this.loading.set(true);

    try {
      // POST /api/users — el backend valida el email duplicado (409)
      // y hashea la contraseña; ya no hace falta chequear "existe" acá.
      await firstValueFrom(this.usersApi.create({ name, email, password, role: 'client' }));

      this.successMsg.set('¡Registro exitoso!');
      setTimeout(() => this.router.navigate(['/login']), 1500);
    } catch (error) {
      this.errors.set({ ...EMPTY_ERRORS, general: apiErrorMessage(error, 'users') });
    } finally {
      this.loading.set(false);
    }
  }
}
