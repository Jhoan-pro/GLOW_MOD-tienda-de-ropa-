import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register-user.html',
  styleUrl: './register-user.css',
})
export class RegisterUser {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  message: string = '';

  constructor(
    private router: Router,
    private userService: UserService,
  ) {}

  register() {
    // Campos vacíos
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.message = 'Todos los campos son obligatorios';
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(this.email)) {
      this.message = 'Correo inválido';
      return;
    }

    // Validar contraseña
    if (this.password.length < 6) {
      this.message = 'La contraseña debe tener mínimo 6 caracteres';
      return;
    }

    // Confirmar contraseña
    if (this.password !== this.confirmPassword) {
      this.message = 'Las contraseñas no coinciden';
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
    this.message = 'Registro exitoso';

    // Simulación de registro
    this.message = 'Registro exitoso';

    // Redirigir al login
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1500);
  }
}
