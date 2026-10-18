import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboard {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  protected readonly sidebarOpen = signal(false);
  protected readonly mostrarConfirmLogout = signal(false);

  protected readonly isSubAdmin = computed(
    () => this.userService.currentUser()?.role === 'sub-admin',
  );
  protected readonly currentUserName = computed(
    () => this.userService.currentUser()?.name || 'Administrador',
  );

  protected logout(): void {
    this.mostrarConfirmLogout.set(true);
  }

  protected confirmarLogout(): void {
    this.userService.logout();
    this.mostrarConfirmLogout.set(false);
    this.router.navigate(['/login']);
  }
}
