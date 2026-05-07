import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  sidebarOpen = false;
  mostrarConfirmLogout = false;
  isSubAdmin = false;
    currentUserName = '';

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    const currentUser = this.userService.getCurrentUser();
    this.isSubAdmin = currentUser?.role === 'sub-admin';
    this.currentUserName = currentUser?.name || 'Administrador';
  }

  logout() {
    this.mostrarConfirmLogout = true;
  }

  confirmarLogout() {
    this.router.navigate(['/login']);
  }
}