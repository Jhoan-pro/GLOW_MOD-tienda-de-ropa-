import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthSession } from '../core/auth/auth-session';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboard {
  private readonly router = inject(Router);
  private readonly session = inject(AuthSession);

  protected readonly sidebarOpen = signal(false);
  protected readonly mostrarConfirmLogout = signal(false);

  protected readonly isSubAdmin = computed(
    () => (this.session.user()?.role ?? '').toLowerCase() === 'sub-admin',
  );
  protected readonly currentUserName = computed(
    () => this.session.user()?.name || 'Administrador',
  );

  protected logout(): void {
    this.mostrarConfirmLogout.set(true);
  }

  protected confirmarLogout(): void {
    this.session.clear();
    this.mostrarConfirmLogout.set(false);
    this.router.navigate(['/login']);
  }
}
