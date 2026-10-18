import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Home } from '../home/home';
import { CartItem, CartService } from '../services/cart.service';
import { UserService } from '../services/user.service';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, Home],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'clickFuera($event)',
  },
})
export class Navbar {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly cartService = inject(CartService);
  private readonly userService = inject(UserService);

  protected readonly items = this.cartService.items;
  protected readonly cantidadTotal = this.cartService.count;
  protected readonly total = this.cartService.total;
  protected readonly isLoggedIn = computed(() => this.userService.currentUser() !== null);

  protected readonly mostrarConfirmLogout = signal(false);
  protected readonly mostrarFiltros = signal(false);
  protected readonly menuUsuarioAbierto = signal(false);
  protected readonly carritoAbierto = signal(false);

  constructor() {
    this.cartService.loadCart();
  }

  protected toggleFiltros(): void {
    this.mostrarFiltros.update((open) => !open);

    if (this.mostrarFiltros()) {
      this.menuUsuarioAbierto.set(false);
      this.carritoAbierto.set(false);
    }
  }

  protected toggleMenuUsuario(): void {
    this.menuUsuarioAbierto.update((open) => !open);

    if (this.menuUsuarioAbierto()) {
      this.mostrarFiltros.set(false);
      this.carritoAbierto.set(false);
    }
  }

  protected toggleCarrito(): void {
    this.carritoAbierto.update((open) => !open);

    if (this.carritoAbierto()) {
      this.mostrarFiltros.set(false);
      this.menuUsuarioAbierto.set(false);
    }
  }

  protected cerrarCarrito(): void {
    this.carritoAbierto.set(false);
  }

  protected logout(): void {
    this.mostrarConfirmLogout.set(true);
  }

  protected confirmarLogout(): void {
    this.userService.logout();
    this.cartService.clearCart();
    this.mostrarConfirmLogout.set(false);
    this.router.navigate(['/login']);
  }

  protected clickFuera(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const clickDentro =
      target.closest('.search-box') ||
      target.closest('.user-dropdown') ||
      target.closest('.cart-panel') ||
      target.closest('.cart-icon');

    if (!clickDentro) {
      this.mostrarFiltros.set(false);
      this.menuUsuarioAbierto.set(false);
      this.carritoAbierto.set(false);
    }
  }

  protected eliminar(index: number): void {
    this.cartService.removeItem(index);
  }

  protected aumentar(item: CartItem): void {
    this.cartService.increase(item);
  }

  protected disminuir(item: CartItem): void {
    this.cartService.decrease(item);
  }

  protected vaciar(): void {
    this.cartService.clearCart();
  }

  protected selectCategory(category: string): void {
    this.mostrarFiltros.set(false);

    const targetId = category === 'Todos' ? 'catalogo' : slugify(category);

    this.router.navigate(['/']).then(() => {
      setTimeout(() => {
        this.document.getElementById(targetId)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 80);
    });
  }
}
