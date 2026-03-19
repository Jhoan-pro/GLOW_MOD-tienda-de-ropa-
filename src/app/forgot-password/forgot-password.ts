import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {

  email: string = '';
  message: string = '';

  sendRecovery() {

    // Validar campo vacío
    if (!this.email) {
      this.message = 'El correo es obligatorio';
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(this.email)) {
      this.message = 'Correo inválido';
      return;
    }

    // Simulación de envío
    this.message = 'Se ha enviado un enlace de recuperación al correo';
  }
}
