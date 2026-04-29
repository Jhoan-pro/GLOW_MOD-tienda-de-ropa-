import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  sidebarOpen = false;
  constructor(private router: Router) {}
  mostrarConfirmLogout = false;
  

  logout() {
  this.mostrarConfirmLogout = true;
}

confirmarLogout() {
  this.router.navigate(['/login']);
}
}
