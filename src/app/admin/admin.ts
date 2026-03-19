import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {

  constructor(private router: Router) {}

  logout() {

    const confirmExit = confirm('¿Estás seguro de que deseas cerrar sesión?');

    if (confirmExit) {
      // redirigir al login
      this.router.navigate(['/login']);
    }
  }
}