import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

type ErrorKeys = 'address' | 'birthDate' | 'idNumber' | 'country';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css'],
})
export class UserProfile implements OnInit {
  user: User = {
    name: '',
    email: '',
    role: 'client',
    active: true,
    address: '',
    birthDate: '',
    idNumber: '',
    country: '',
    phone: '',
    city: '',
  };

  editMode = false;
  hasExtraInfo = false;

  errors: Partial<Record<ErrorKeys, string>> = {};
  submitted = false;

  constructor(
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit() {
    const currentUser = this.userService.getCurrentUser();

    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const users = this.userService.getUsers();
    const savedUser = users.find((u) => u.email === currentUser.email || u.id === currentUser.id);

    this.user = savedUser ? { ...savedUser } : { ...currentUser };

    this.hasExtraInfo = !!(
      this.user.address &&
      this.user.birthDate &&
      this.user.idNumber &&
      this.user.country
    );
  }

  enableEdit() {
    this.editMode = true;
    this.submitted = false;
    this.errors = {};
  }

  normalizeLetters(value: string = ''): string {
    return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').replace(/\s{2,}/g, ' ');
  }

  normalizeDigits(value: string = ''): string {
    return value.replace(/\D/g, '');
  }

  normalizeAddress(value: string = ''): string {
    return value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ#\-\.,\s]/g, '');
  }

  allowOnlyLetters(event: KeyboardEvent) {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(event.key) && !allowed.includes(event.key)) {
      event.preventDefault();
    }
  }

  allowOnlyDigits(event: KeyboardEvent) {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
    if (!/^\d$/.test(event.key) && !allowed.includes(event.key)) {
      event.preventDefault();
    }
  }

  validarEdad(fecha: string): boolean {
    const birth = new Date(fecha);
    const today = new Date();

    let edad = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      edad--;
    }

    return edad >= 18;
  }

  validarFormulario(): boolean {
    this.errors = {};

    if (!this.user.address?.trim()) {
      this.errors.address = 'Dirección obligatoria. Ej: Cra 12 # 34-56';
    } else if (this.user.address.trim().length < 5) {
      this.errors.address = 'Dirección muy corta';
    }

    if (!this.user.birthDate) {
      this.errors.birthDate = 'Fecha obligatoria';
    } else if (!this.validarEdad(this.user.birthDate)) {
      this.errors.birthDate = 'Debes tener al menos 18 años';
    }

    if (!this.user.idNumber?.trim()) {
      this.errors.idNumber = 'Documento obligatorio';
    } else if (!/^\d{6,12}$/.test(this.user.idNumber)) {
      this.errors.idNumber = 'Solo números (6 a 12 dígitos)';
    }

    if (!this.user.country?.trim()) {
      this.errors.country = 'Selecciona un país';
    }

    return Object.keys(this.errors).length === 0;
  }

  save() {
    this.submitted = true;
    if (!this.validarFormulario()) return;

    this.user.address = this.user.address?.trim();
    this.user.country = this.user.country?.trim();
    this.user.phone = this.user.phone?.trim();
    this.user.city = this.user.city?.trim();

    if (!this.user.id) {
      const currentUser = this.userService.getCurrentUser();
      if (currentUser?.id) this.user.id = currentUser.id;
    }

    this.userService.updateUserProfile(this.user);

    this.editMode = false;
    this.hasExtraInfo = !!(
      this.user.address &&
      this.user.birthDate &&
      this.user.idNumber &&
      this.user.country
    );
  }

  volver() {
    this.router.navigate(['/home']);
  }
}
