import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartService } from '../services/cart.service';

export const cartGuard: CanActivateFn = () => {

  const cartService = inject(CartService);
  const router = inject(Router);

  if (cartService.getItems().length > 0) {
    return true;
  } else {
    alert("Tu carrito está vacío");
    router.navigate(['/']);
    return false;
  }
};