import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  sidebarOpen = false;
  constructor(private router: Router) {}

  logout() {
    const confirmacion = confirm('¿Seguro que deseas cerrar sesión?');

    if (confirmacion) {
      this.router.navigate(['/register']);
    }
  }
}
