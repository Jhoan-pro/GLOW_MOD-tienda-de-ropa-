import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email: string = '';
  password: string = '';

  errors: any = {
    email: '',
    password: '',
    general: '',
  };



  constructor(
    private router: Router,
    private UserService: UserService,
    private cartService: CartService,
  ) { }

  login() {
    this.errors = { email: '', password: '', general: '' };

    // Validación: campos vacíos
    if (!this.email || !this.password) {
      this.errors.general = 'Todos los campos son obligatorios';
      return;
    }

    // Campos vacíos
    if (!this.email) this.errors.email = 'El correo es obligatorio';
    if (!this.password) this.errors.password = 'La contraseña es obligatoria';
    if (this.errors.email || this.errors.password) return;

    // Formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errors.email = 'Correo inválido. ej: ejemplo@gmail.com';
      return;
    }

    // Longitud de contraseña
    if (this.password.length < 6) {
      this.errors.password = 'La contraseña debe tener mínimo 6 caracteres';
      return;
    }

    // Usuario administrador predefinido 
    if (this.email === 'admin@gmail.com' && this.password === '123456') {
      this.errors = '';

      // REDIRECCIÓN
      this.router.navigate(['/admin-dashboard/admin']);
    } else {
      this.errors.general = 'Credenciales incorrectas';
    }
    // Buscar usuario
    const users = this.UserService.getUsers();
    const userFound = users.find(
      (u) => u.email === this.email && u.password === this.password
    );

    if (userFound) {
      if (!userFound.active) {
        this.errors.general = 'Tu cuenta ha sido deshabilitada. Contacta al admin.';
        return;
      }
      this.UserService.login(userFound);
      this.cartService.loadCart();
      this.redirectByRole(userFound.role);
    } else {
      this.errors.general = 'Correo o contraseña incorrectos';
    }
  }
  private redirectByRole(role: string) {
    if (role === 'admin') this.router.navigate(['/admin-dashboard/admin']);
    else if (role === 'cashier') this.router.navigate(['/dashboard/cashier']);
    else this.router.navigate(['/']);
  }


  volver() {
    this.router.navigate(['/register']);
  }
}
