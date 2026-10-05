import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { AuthSession } from '../core/auth/auth-session';
import { apiErrorMessage } from '../core/auth/api-error';
import { UserRole } from '../core/auth/auth-api';

interface LoginErrors {
  email: string;
  password: string;
  general: string;
}

const EMPTY_ERRORS: LoginErrors = { email: '', password: '', general: '' };
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly router = inject(Router);
  private readonly session = inject(AuthSession);
  private readonly cartService = inject(CartService);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly errors = signal<LoginErrors>(EMPTY_ERRORS);
  protected readonly loading = signal(false);

  protected async login(): Promise<void> {
    this.errors.set(EMPTY_ERRORS);

    const email = this.email().trim();
    const password = this.password();

    // Ambos vacíos
    if (!email && !password) {
      this.fail('Todos los campos son obligatorios');
      return;
    }

    const errors: LoginErrors = { ...EMPTY_ERRORS };

    if (!email) errors.email = 'El correo es obligatorio';
    if (!password) errors.password = 'La contraseña es obligatoria';

    // Formato del correo, solo si escribió algo
    if (email && !EMAIL_REGEX.test(email)) {
      errors.email = 'Correo inválido. Ej: ejemplo@gmail.com';
    }

    // Longitud de la contraseña, solo si escribió algo
    if (password && password.length < 6) {
      errors.password = 'La contraseña debe tener mínimo 6 caracteres';
    }

    if (errors.email || errors.password) {
      this.errors.set(errors);
      return;
    }

    this.loading.set(true);

    try {
      // AuthSession.login llama a POST /api/auth/login, guarda el token
      // y después hidrata /api/auth/me para traer el usuario actual.
      const success = await this.session.login({ email, password });

      if (!success) {
        this.fail('Correo o contraseña incorrectos');
        return;
      }

      this.cartService.loadCart();
      this.redirectByRole(this.session.user()?.role);
    } catch (error) {
      // Acá cae el 401 real del backend (credenciales inválidas),
      // traducido a un mensaje legible por apiErrorMessage.
      this.fail(apiErrorMessage(error, 'login'));
    } finally {
      this.loading.set(false);
    }
  }

  protected volver(): void {
    this.router.navigate(['/register']);
  }

  private fail(general: string): void {
    this.errors.set({ ...EMPTY_ERRORS, general });
  }

  private redirectByRole(role: UserRole | undefined): void {
    switch (role) {
      case 'ADMIN':
        this.router.navigate(['/admin-dashboard/admin']);
        break;
      case 'SUB_ADMIN':
        this.router.navigate(['/admin-dashboard/dashBoard']);
        break;
      case 'CASHIER':
        this.router.navigate(['/dashboard/cashier']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}
