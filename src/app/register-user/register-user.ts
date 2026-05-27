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
  successMsg: string = '';

  errors: any = {
    email: '',
    password: '',
    confirmPassword: '',
    general: '',
  };

  constructor(
    private router: Router,
    private userService: UserService,
  ) { }

  register() {
    this.errors = {
      email: '',
      password: '',
      confirmPassword: '',
      general: '',
    };

    this.successMsg = '';

    const name = this.name.trim();
    const email = this.email.trim();

    //Todos vacíos
    if (!name && !email && !this.password && !this.confirmPassword) {
      this.errors.general = 'Todos los campos son obligatorios';
      return;
    }

    // Validaciones individuales
    if (!name) {
      this.errors.general = 'El nombre es obligatorio';
    }

    if (!email) {
      this.errors.email = 'El correo es obligatorio';
    }

    if (!this.password) {
      this.errors.password = 'La contraseña es obligatoria';
    }

    if (!this.confirmPassword) {
      this.errors.confirmPassword =
        'Debes confirmar la contraseña';
    }

    //  Validar formato correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !emailRegex.test(email)) {
      this.errors.email =
        'Correo inválido. Ej: ejemplo@gmail.com';
    }

    //  Validar longitud contraseña
    if (this.password && this.password.length < 6) {
      this.errors.password =
        'La contraseña debe tener mínimo 6 caracteres';
    }

    //  Validar coincidencia
    if (
      this.password &&
      this.confirmPassword &&
      this.password !== this.confirmPassword
    ) {
      this.errors.confirmPassword =
        'Las contraseñas no coinciden';
    }

    //  Si existe cualquier error 
    if (
      this.errors.email ||
      this.errors.password ||
      this.errors.confirmPassword ||
      this.errors.general
    ) {
      return;
    }

    //  Validar si correo ya existe
    const usuarios = this.userService.getUsers();

    const existe = usuarios.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existe) {
      this.errors.general =
        'Este correo ya está registrado';
      return;
    }

    //  Crear usuario
    const newUser: User = {
      name: name,
      email: email,
      password: this.password,
      role: 'client',
      active: true,
    };

    this.userService.addUser(newUser);

    this.successMsg = '¡Registro exitoso!';

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1500);
  }

}
