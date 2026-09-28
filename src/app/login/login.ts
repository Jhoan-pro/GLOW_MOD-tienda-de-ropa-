import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { User } from '../models/user.model';
import { CartService } from '../services/cart.service';
import { UserService } from '../services/user.service';

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
  private readonly userService = inject(UserService);
  private readonly cartService = inject(CartService);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly errors = signal<LoginErrors>(EMPTY_ERRORS);

  protected login(): void {
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

    const emailLower = email.toLowerCase();
    const userFound = this.userService
      .getUsers()
      .find((u) => u.email.toLowerCase() === emailLower && u.password === password);

    if (!userFound) {
      this.fail('Correo o contraseña incorrectos');
      return;
    }

    if (!userFound.active) {
      this.fail('Tu cuenta ha sido deshabilitada. Contacta al admin.');
      return;
    }

    if (!this.userService.login(userFound)) {
      this.fail(
        'Sesión activa detectada. Ya tienes una sesión iniciada en este dispositivo. Cierra la sesión anterior para continuar.',
      );
      return;
    }

    this.cartService.loadCart();
    this.redirectByRole(userFound.role);
  }

  protected volver(): void {
    this.router.navigate(['/register']);
  }

  private fail(general: string): void {
    this.errors.set({ ...EMPTY_ERRORS, general });
  }

  private redirectByRole(role: User['role']): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin-dashboard/admin']);
        break;
      case 'sub-admin':
        this.router.navigate(['/admin-dashboard/dashBoard']);
        break;
      case 'cashier':
        this.router.navigate(['/dashboard/cashier']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}