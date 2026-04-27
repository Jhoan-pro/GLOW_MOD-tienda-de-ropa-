import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register-user.html',
  styleUrl: './register-user.css',
})
export class RegisterUser {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  errors: any = {
    email: '',
    password: '',
    confirmPassword: '',
    general: '',
  };

  constructor(
    private router: Router,
    private userService: UserService,
  ) {}

  register() {
    this.errors = { email: '', password: '', confirmPassword: '', general: '' };

    // Campos vacíos
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.errors.general = 'Todos los campos son obligatorios';
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(this.email)) {
      this.errors.email = 'Correo inválido. ej: ejemplo@gmail.com';
      return;
    }

    // Validar contraseña
    if (this.password.length < 6) {
      this.errors.password = 'La contraseña debe tener mínimo 6 caracteres';
      return;
    }

    // Confirmar contraseña
    if (this.password !== this.confirmPassword) {
      this.errors.confirmPassword = 'Las contraseñas no coinciden';
      return;
    }
    
    const usuarios = this.userService.getUsers();
    const existe = usuarios.some((u) => u.email.toLowerCase() === this.email.toLowerCase());

    if (existe) {
      this.errors.email = 'Este correo ya está registrado';
      return;
    }

    const newUser: User = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: 'client',
      active: true,
    };

    this.userService.addUser(newUser);
    this.errors.general = 'Registro exitoso';

    // Redirigir al login
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1500);
  }
}
