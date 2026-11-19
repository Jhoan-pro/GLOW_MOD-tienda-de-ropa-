import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';
import { API_BASE_URL } from './api-config';

export type UserRole =
  | 'admin'
  | 'sub-admin'
  | 'cashier'
  | 'client'
  | 'ADMIN'
  | 'SUB_ADMIN'
  | 'CASHIER'
  | 'CLIENT';

export type NormalizedRole = 'admin' | 'sub-admin' | 'cashier' | 'client';

// Backend responses carry the Prisma enum member (`SUB_ADMIN`); the UI uses
// the lowercase hyphenated form (`sub-admin`). Normalize in one place.
export function normalizeRole(role: string | undefined | null): NormalizedRole {
  const value = (role ?? '').toLowerCase().replace(/_/g, '-');
  return value === 'admin' || value === 'sub-admin' || value === 'cashier'
    ? value
    : 'client';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  login(credentials: LoginRequest) {
    return this.http
      .post<LoginResponse>(`${this.base}/auth/login`, credentials)
      .pipe(timeout(10_000));
  }

  me() {
    return this.http.get<CurrentUser>(`${this.base}/auth/me`).pipe(timeout(10_000));
  }
}
