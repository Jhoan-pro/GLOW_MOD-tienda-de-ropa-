import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

type ErrorKeys =
  | 'address'
  | 'birthDate'
  | 'idNumber'
  | 'country';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css']
})
export class UserProfile implements OnInit {

  user: any = {};
  editMode = false;
  hasExtraInfo = false;

  errors: Partial<Record<ErrorKeys, string>> = {};
  submitted = false;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    const currentUser = this.userService.getCurrentUser();

    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.user = { ...currentUser };

    this.hasExtraInfo = !!this.user.address;
  }

  enableEdit() {
    this.editMode = true;
  }

  // 🔹 NORMALIZADORES
  normalizeLetters(value: string): string {
    return value
      .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
      .replace(/\s{2,}/g, ' ');
  }

  normalizeDigits(value: string): string {
    return value.replace(/\D/g, '');
  }

  normalizeAddress(value: string): string {
    return value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ#\-\.,\s]/g, '');
  }

  // 🔹 BLOQUEO DE TECLAS
  allowOnlyLetters(event: KeyboardEvent) {
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(event.key) &&
        !['Backspace','Delete','ArrowLeft','ArrowRight','Tab'].includes(event.key)) {
      event.preventDefault();
    }
  }

  allowOnlyDigits(event: KeyboardEvent) {
    if (!/^\d$/.test(event.key) &&
        !['Backspace','Delete','ArrowLeft','ArrowRight','Tab'].includes(event.key)) {
      event.preventDefault();
    }
  }

  // 🔹 VALIDAR EDAD
  validarEdad(fecha: string): boolean {
    const birth = new Date(fecha);
    const today = new Date();

    let edad = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      edad--;
    }

    return edad >= 13; // puedes cambiar a 18 si quieres
  }

 
  validarFormulario(): boolean {
    this.errors = {};

    // Dirección
    if (!this.user.address?.trim()) {
      this.errors.address = 'Dirección obligatoria. Ej: Cra 12 # 34-56';
    } else if (this.user.address.length < 5) {
      this.errors.address = 'Dirección muy corta';
    }

    // Fecha nacimiento
    if (!this.user.birthDate) {
      this.errors.birthDate = 'Fecha obligatoria';
    } else if (!this.validarEdad(this.user.birthDate)) {
      this.errors.birthDate = 'Debes tener al menos 13 años';
    }

    // Documento
    if (!this.user.idNumber?.trim()) {
      this.errors.idNumber = 'Documento obligatorio';
    } else if (!/^\d{6,12}$/.test(this.user.idNumber)) {
      this.errors.idNumber = 'Solo números (6 a 12 dígitos)';
    }

    // País
    if (!this.user.country?.trim()) {
      this.errors.country = 'País obligatorio';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.user.country)) {
      this.errors.country = 'Solo letras';
    }

    return Object.keys(this.errors).length === 0;
  }

  save() {
    this.submitted = true;

    if (!this.validarFormulario()) return;

    // Normalizar antes de guardar
    this.user.address = this.user.address.trim();
    this.user.country = this.user.country.trim();

    this.userService.login(this.user);

    this.editMode = false;
    this.hasExtraInfo = true;
  }

  volver() {
    this.router.navigate(['/home']);
  }
}