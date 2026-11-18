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
import { AuthSession } from '../core/auth/auth-session';
import { CatalogSearch } from '../services/catalog-search';

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
  private readonly authSession = inject(AuthSession);
  protected readonly catalogSearch = inject(CatalogSearch);

  protected readonly items = this.cartService.items;
  protected readonly cantidadTotal = this.cartService.count;
  protected readonly total = this.cartService.total;
  protected readonly isLoggedIn = this.authSession.authenticated;

  protected readonly mostrarConfirmLogout = signal(false);
  protected readonly modalMensaje = signal<string | null>(null);
  protected readonly mostrarFiltros = signal(false);
  protected readonly menuUsuarioAbierto = signal(false);
  protected readonly carritoAbierto = signal(false);

  constructor() {
    void this.cartService.loadCart();
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
    this.authSession.clear();
    this.cartService.resetLocal();
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

  protected setSearch(event: Event): void {
    this.catalogSearch.query.set((event.target as HTMLInputElement).value);
    this.mostrarFiltros.set(false);
  }

  protected selectCategory(category: string): void {
    this.mostrarFiltros.set(false);

    this.router.navigate(['/']).then(() => {
      this.scrollToCategory(category);
    });
  }

  private scrollToCategory(category: string, attempt = 0): void {
    const isAll = category === 'Todos';
    const container = this.document.getElementById('catalogo');
    const catalogLoaded = !!container?.querySelector('.category-section');
    const target = isAll ? null : this.document.getElementById(slugify(category));

    if (isAll && catalogLoaded) {
      container?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (catalogLoaded || attempt >= 25) {
      this.modalMensaje.set(
        isAll || !catalogLoaded
          ? 'No hay productos disponibles por el momento.'
          : `No hay productos en la categoría "${category}".`,
      );
      return;
    }

    setTimeout(() => this.scrollToCategory(category, attempt + 1), 100);
  }
}
