import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly tokenKey = 'token';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>('http://localhost:3000/api/login', { email, password })
      .pipe(
        tap((response) => {
          if (isPlatformBrowser(this.platformId)) {
            sessionStorage.setItem(this.tokenKey, response.token);
          }
        })
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