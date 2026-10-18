import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPassword {
  protected readonly email = signal('');
  protected readonly message = signal('');

  protected sendRecovery(): void {
    const email = this.email();

    // Valida campo vacío
    if (!email) {
      this.message.set('El correo es obligatorio');
      return;
    }

    // Validar formato de email
    if (!EMAIL_REGEX.test(email)) {
      this.message.set('Correo inválido');
      return;
    }

    // Simulación de envío
    this.message.set('Se ha enviado un enlace de recuperación al correo');
  }
}
