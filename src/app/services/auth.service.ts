import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  private userEmail = new BehaviorSubject<string | null>(null);

  // Observables para que otros componentes se suscriban
  isLoggedIn$: Observable<boolean> = this.loggedIn.asObservable();
  userEmail$: Observable<string | null> = this.userEmail.asObservable();

  constructor(private http: HttpClient) {}

  // Método de login contra tu backend
  login(email: string, password: string) {
    return this.http.post<any>('http://localhost:3000/api/login', { email, password })
      .subscribe({
        next: (response) => {
          // Aquí asumo que tu backend devuelve un token y el email del usuario
          localStorage.setItem('token', response.token);
          this.loggedIn.next(true);
          this.userEmail.next(email);
        },
        error: (err) => {
          console.error('Error en login', err);
          this.loggedIn.next(false);
          this.userEmail.next(null);
        }
      });
  }

  logout() {
    localStorage.removeItem('token');
    this.loggedIn.next(false);
    this.userEmail.next(null);
  }

  // Método para verificar si hay sesión activa al recargar la página
  checkSession() {
    const token = localStorage.getItem('token');
    if (token) {
      this.loggedIn.next(true);
      // Podrías decodificar el token para obtener el email
      this.userEmail.next('usuario@ejemplo.com');
    } else {
      this.loggedIn.next(false);
      this.userEmail.next(null);
    }
  }
}
