import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';
import { API_BASE_URL } from '../core/auth/api-config';
import { CurrentUser, UserRole } from '../core/auth/auth-api';

// The backend always creates a `client` and rejects/strips any role sent here.
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  // POST /api/users — el interceptor le agrega el token si hay sesión,
  // pero esta ruta es pública (se usa también para auto-registro).
  create(user: CreateUserRequest) {
    return this.http.post<CurrentUser>(`${this.base}/users`, user).pipe(timeout(10_000));
  }

  list() {
    return this.http.get<CurrentUser[]>(`${this.base}/users`).pipe(timeout(10_000));
  }

  // PATCH /api/users/:id/admin — admin only. Role and active flag.
  updateAdmin(id: number, changes: { role?: UserRole; active?: boolean }) {
    return this.http
      .patch<CurrentUser>(`${this.base}/users/${id}/admin`, changes)
      .pipe(timeout(10_000));
  }
}
