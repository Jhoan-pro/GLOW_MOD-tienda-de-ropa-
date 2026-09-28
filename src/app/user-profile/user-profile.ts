import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';

type ErrorKeys = 'address' | 'birthDate' | 'idNumber' | 'country';
type ProfileErrors = Partial<Record<ErrorKeys, string>>;

const COUNTRIES = [
  'Argentina',
  'Bolivia',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Cuba',
  'Ecuador',
  'El Salvador',
  'España',
  'Estados Unidos',
  'Guatemala',
  'Honduras',
  'México',
  'Nicaragua',
  'Panamá',
  'Paraguay',
  'Perú',
  'Puerto Rico',
  'República Dominicana',
  'Uruguay',
  'Venezuela',
] as const;

const NAVIGATION_KEYS = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];

const EMPTY_USER: User = {
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

@Component({
  selector: 'app-user-profile',
  imports: [FormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfile implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  protected readonly countries = COUNTRIES;

  protected readonly user = signal<User>(EMPTY_USER);
  protected readonly editMode = signal(false);
  protected readonly submitted = signal(false);
  protected readonly errors = signal<ProfileErrors>({});

  protected readonly hasExtraInfo = computed(() => {
    const { address, birthDate, idNumber, country } = this.user();
    return !!(address && birthDate && idNumber && country);
  });

  ngOnInit(): void {
    const currentUser = this.userService.currentUser();

    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const savedUser = this.userService
      .users()
      .find((u) => u.email === currentUser.email || u.id === currentUser.id);

    this.user.set(savedUser ? { ...savedUser } : { ...currentUser });
  }

  protected patch<K extends keyof User>(key: K, value: User[K]): void {
    this.user.update((user) => ({ ...user, [key]: value }));
  }

  protected enableEdit(): void {
    this.editMode.set(true);
    this.submitted.set(false);
    this.errors.set({});
  }

  protected normalizeLetters(value = ''): string {
    return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').replace(/\s{2,}/g, ' ');
  }

  protected normalizeDigits(value = ''): string {
    return value.replace(/\D/g, '');
  }

  protected normalizeAddress(value = ''): string {
    return value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ#\-\.,\s]/g, '');
  }

  protected allowOnlyLetters(event: KeyboardEvent): void {
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(event.key) && !NAVIGATION_KEYS.includes(event.key)) {
      event.preventDefault();
    }
  }

  protected allowOnlyDigits(event: KeyboardEvent): void {
    if (!/^\d$/.test(event.key) && !NAVIGATION_KEYS.includes(event.key)) {
      event.preventDefault();
    }
  }

  protected validarEdad(fecha: string): boolean {
    const birth = new Date(fecha);
    const today = new Date();

    let edad = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      edad--;
    }

    return edad >= 18;
  }

  protected validarFormulario(): boolean {
    const user = this.user();
    const errors: ProfileErrors = {};

    if (!user.address?.trim()) {
      errors.address = 'Dirección obligatoria. Ej: Cra 12 # 34-56';
    } else if (user.address.trim().length < 5) {
      errors.address = 'Dirección muy corta';
    }

    if (!user.birthDate) {
      errors.birthDate = 'Fecha obligatoria';
    } else if (!this.validarEdad(user.birthDate)) {
      errors.birthDate = 'Debes tener al menos 18 años';
    }

    if (!user.idNumber?.trim()) {
      errors.idNumber = 'Documento obligatorio';
    } else if (!/^\d{6,12}$/.test(user.idNumber)) {
      errors.idNumber = 'Solo números (6 a 12 dígitos)';
    }

    if (!user.country?.trim()) {
      errors.country = 'Selecciona un país';
    }

    this.errors.set(errors);
    return Object.keys(errors).length === 0;
  }

  protected save(): void {
    this.submitted.set(true);
    if (!this.validarFormulario()) return;

    const user: User = {
      ...this.user(),
      address: this.user().address?.trim(),
      country: this.user().country?.trim(),
      phone: this.user().phone?.trim(),
      city: this.user().city?.trim(),
    };

    if (!user.id) {
      const currentId = this.userService.currentUser()?.id;
      if (currentId) user.id = currentId;
    }

    this.user.set(user);
    this.userService.updateUserProfile(user);
    this.editMode.set(false);
  }

  protected volver(): void {
    this.router.navigate(['/home']);
  }
}