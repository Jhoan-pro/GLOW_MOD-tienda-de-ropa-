import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class Login {
// Variables para almacenar lo que el usuario escribe
  email: string = '';
  password: string = '';
  errorMsg: string = '';

  login() {
    if (this.email && this.password) {
      console.log('Intentando ingresar con:', this.email, this.password);
      this.errorMsg = '';
   
    } else {
      this.errorMsg = 'Por favor, rellena todos los campos.';
    }
  }
}
