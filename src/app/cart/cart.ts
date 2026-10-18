import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartService } from '../services/cart.service';

export const cartGuard: CanActivateFn = () => {
  const cartService = inject(CartService);
  const router = inject(Router);
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  cartService.loadCart();

  if (cartService.items().length > 0) {
    return true;
  }

  // alert() no existe en el servidor (SSR / prerender)
  if (isBrowser) {
    alert('Tu carrito está vacío');
  }
  return router.createUrlTree(['/']);
};
