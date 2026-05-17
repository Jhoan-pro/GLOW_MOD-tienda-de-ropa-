import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';

  errors: any = {
    email: '',
    password: '',
    general: '',
  };

  constructor(
    private router: Router,
    private userService: UserService,
    private cartService: CartService,
  ) {}

  login() {
    this.errors = { email: '', password: '', general: '' };

    const email = this.email.trim();
    const emailLower = email.toLowerCase();

    if (!email || !this.password) {
      this.errors.general = 'Todos los campos son obligatorios';
      return;
    }

    if (!email) {
      this.errors.email = 'El correo es obligatorio';
      return;
    }

    if (!this.password) {
      this.errors.password = 'La contraseña es obligatoria';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.errors.email = 'Correo inválido. Ej: ejemplo@gmail.com';
      return;
    }

    if (this.password.length < 6) {
      this.errors.password = 'La contraseña debe tener mínimo 6 caracteres';
      return;
    }

    const users = this.userService.getUsers();
    const userFound = users.find(
      (u) =>
        u.email.toLowerCase() === emailLower &&
        u.password === this.password
    );

    if (!userFound) {
      this.errors.general = 'Correo o contraseña incorrectos';
      return;
    }

    if (!userFound.active) {
      this.errors.general =
        'Tu cuenta ha sido deshabilitada. Contacta al admin.';
      return;
    }

    const loginSuccess = this.userService.login(userFound);

    if (!loginSuccess) {
      this.errors.general =
        'Sesión activa detectada. Ya tienes una sesión iniciada en este dispositivo. Cierra la sesión anterior para continuar.';
      return;
    }

    this.cartService.loadCart();
    this.redirectByRole(userFound.role);
  }

  private redirectByRole(role: string) {
    if (role === 'admin') this.router.navigate(['/admin-dashboard/admin']);
    else if (role === 'sub-admin') this.router.navigate(['/admin-dashboard/dashBoard']);
    else if (role === 'cashier') this.router.navigate(['/dashboard/cashier']);
    else this.router.navigate(['/']);
  }

  volver() {
    this.router.navigate(['/register']);
  }
}