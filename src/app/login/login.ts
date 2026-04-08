import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email: string = '';
  password: string = '';
  message: string = '';

  constructor(
    private router: Router,
    private UserService: UserService,
  ) {}

  login() {
    // Validación: campos vacíos
    if (!this.email || !this.password) {
      this.message = 'Todos los campos son obligatorios';
      return;
    }

    // Validación: formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(this.email)) {
      this.message = 'Correo electrónico inválido';
      return;
    }

    // Validación: longitud de contraseña
    if (this.password.length < 6) {
      this.message = 'La contraseña debe tener mínimo 6 caracteres';
      return;
    }

    // Simulación de login (administrador)
    if (this.email === 'admin@gmail.com' && this.password === '123456') {
      this.message = '';

      // REDIRECCIÓN
      this.router.navigate(['/admin-dashboard/admin']);
    } else {
      this.message = 'Credenciales incorrectas';
    }

    
   // validacion de usuarios 
    const users = this.UserService.getUsers();

    const userFound = users.find((u) => u.email === this.email && u.password === this.password);

    if (userFound) {
      this.message = '';

      if (userFound.role === 'admin') {
        this.router.navigate(['/admin-dashboard/admin']);
      } else if (userFound.role === 'cashier') {
        this.router.navigate(['/dashboard/cashier']);
      } else {
     
        this.router.navigate(['/']);
      }
    } else {
      
      this.message = 'Correo o contraseña incorrectos';
    }
  }
}
