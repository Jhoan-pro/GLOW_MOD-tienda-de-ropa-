import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSession } from '../core/auth/auth-session';
import { CartService } from '../services/cart.service';

export const cartGuard: CanActivateFn = async () => {
  const cartService = inject(CartService);
  const session = inject(AuthSession);
  const router = inject(Router);
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  await session.hydrate();
  await cartService.loadCart();

  if (cartService.items().length > 0) {
    return true;
  }

  // alert() no existe en el servidor (SSR / prerender)
  if (isBrowser) {
    alert('Tu carrito está vacío');
  }
  return router.createUrlTree(['/']);
};
