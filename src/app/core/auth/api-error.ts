import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';

type ErrorContext = 'login' | 'session' | 'users' | 'products' | 'orders';

export function apiErrorMessage(error: unknown, context: ErrorContext): string {
  if (error instanceof TimeoutError) {
    return 'La solicitud tardó demasiado. Intentá de nuevo.';
  }

  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.';
    }
    if (error.status === 401) {
      return context === 'login'
        ? 'Correo o contraseña incorrectos.'
        : 'Tu sesión venció. Volvé a iniciar sesión.';
    }
    if (error.status === 403) {
      return 'No tenés permiso para realizar esta acción.';
    }
    if (error.status === 409 && context === 'users') {
      return 'Ese correo ya está en uso.';
    }
    if (error.status === 404) {
      return 'No se encontró el recurso solicitado.';
    }
    if (error.status === 429) {
      return 'Demasiados intentos. Esperá e intentá de nuevo.';
    }
    if (error.status >= 500) {
      return 'El servicio no está disponible temporalmente. Intentá de nuevo más tarde.';
    }
    if (error.status === 400) {
      return 'Revisá la información ingresada e intentá de nuevo.';
    }
  }

  return context === 'login'
    ? 'No se pudo iniciar sesión. Revisá tu conexión e intentá de nuevo.'
    : 'No se pudo completar la operación. Intentá de nuevo.';
}
