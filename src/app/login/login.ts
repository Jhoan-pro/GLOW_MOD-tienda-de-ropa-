import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  email: string = '';
  password: string = '';
  errorMsg: string = '';

  constructor(private router: Router) {}

  login() {

    // Validación: campos vacíos
    if (!this.email || !this.password) {
      this.errorMsg = 'Todos los campos son obligatorios';
      return;
    }

    // Validación: formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(this.email)) {
      this.errorMsg = 'Correo electrónico inválido';
      return;
    }

    // Validación: longitud de contraseña
    if (this.password.length < 6) {
      this.errorMsg = 'La contraseña debe tener mínimo 6 caracteres';
      return;
    }

    // Simulación de login
    if (this.email === 'admin@gmail.com' && this.password === '123456') {

      this.errorMsg = '';

      // REDIRECCIÓN
      this.router.navigate(['./admin']);

    } else {
      this.errorMsg = 'Credenciales incorrectas';
    }
    if (this.email === 'cli@gmail.com' && this.password === '1234567'){
      this.errorMsg ='';

      this.router.navigate(['./home']);{

      }
    }
  }
}
