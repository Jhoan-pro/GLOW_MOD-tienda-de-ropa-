import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

interface LegacyLoginResponse {
  token: string;
}

/**
 * @deprecated Ningún componente lo usa: el login real va por `core/auth/auth-session.ts`.
 * Se migró a `inject()` y se tipó, pero lo recomendable es borrarlo.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'token';

  login(email: string, password: string): Observable<LegacyLoginResponse> {
    return this.http
      .post<LegacyLoginResponse>('http://localhost:3000/api/login', { email, password })
      .pipe(
        tap((response) => {
          if (isPlatformBrowser(this.platformId)) {
            sessionStorage.setItem(this.tokenKey, response.token);
          }
        }),
      );
  }

  logout(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    sessionStorage.removeItem(this.tokenKey);
  }

  checkSession(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return !!sessionStorage.getItem(this.tokenKey);
  }
}
