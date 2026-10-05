import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';
import { API_BASE_URL } from './api-config';

export type UserRole = 'admin' | 'sub-admin' | 'cashier' | 'client';

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
