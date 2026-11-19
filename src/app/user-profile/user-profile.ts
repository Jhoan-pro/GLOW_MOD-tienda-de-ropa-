import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/user.model';
import { ApiUserProfile, UpdateProfileRequest, UsersApi } from '../services/users-api';
import { AuthSession } from '../core/auth/auth-session';
import { apiErrorMessage } from '../core/auth/api-error';
import { normalizeRole } from '../core/auth/auth-api';

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

function toUser(profile: ApiUserProfile): User {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: normalizeRole(profile.role),
    active: profile.active,
    fullName: profile.fullName ?? '',
    phone: profile.phone ?? '',
    city: profile.city ?? '',
    address: profile.address ?? '',
    birthDate: profile.birthDate ? profile.birthDate.slice(0, 10) : '',
    idNumber: profile.idNumber ?? '',
    country: profile.country ?? '',
  };
}

@Component({
  selector: 'app-user-profile',
  imports: [FormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfile implements OnInit {
  private readonly session = inject(AuthSession);
  private readonly usersApi = inject(UsersApi);
  private readonly router = inject(Router);

  protected readonly countries = COUNTRIES;

  protected readonly user = signal<User>(EMPTY_USER);
  protected readonly editMode = signal(false);
  protected readonly submitted = signal(false);
  protected readonly errors = signal<ProfileErrors>({});
  protected readonly saveError = signal('');
  protected readonly saving = signal(false);

  protected readonly hasExtraInfo = computed(() => {
    const { address, birthDate, idNumber, country } = this.user();
    return !!(address && birthDate && idNumber && country);
  });

  async ngOnInit(): Promise<void> {
    const authenticated = await this.session.hydrate();
    const current = this.session.user();

    if (!authenticated || !current) {
      this.router.navigate(['/login']);
      return;
    }

    const base: User = {
      ...EMPTY_USER,
      id: current.id,
      name: current.name,
      email: current.email,
      role: normalizeRole(current.role),
      active: current.active,
    };

    try {
      const profile = await firstValueFrom(this.usersApi.findOne(current.id));
      this.user.set(toUser(profile));
    } catch {
      this.user.set(base);
    }
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

  protected async save(): Promise<void> {
    this.submitted.set(true);
    if (!this.validarFormulario()) return;

    const current = this.user();
    const id = this.session.user()?.id ?? current.id;
    if (!id) return;

    const changes: UpdateProfileRequest = {
      name: current.name,
      fullName: current.fullName?.trim() || undefined,
      phone: current.phone?.trim() || undefined,
      city: current.city?.trim() || undefined,
      address: current.address?.trim(),
      birthDate: current.birthDate,
      idNumber: current.idNumber?.trim(),
      country: current.country?.trim(),
    };

    this.saving.set(true);
    this.saveError.set('');

    try {
      const profile = await firstValueFrom(this.usersApi.updateProfile(id, changes));
      this.user.set(toUser(profile));
      this.editMode.set(false);
    } catch (error) {
      this.saveError.set(apiErrorMessage(error, 'users'));
    } finally {
      this.saving.set(false);
    }
  }

  protected volver(): void {
    this.router.navigate(['/Home']);
  }
}