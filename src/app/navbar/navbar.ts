import {
  Component,
  ViewEncapsulation,
  HostListener,
  ElementRef,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { NgForOf, NgIf, isPlatformBrowser } from '@angular/common';
import { CartService } from '../services/cart.service';
import { UserService } from '../services/user.service';
import { FilterService } from '../services/filter.service';
import { Home } from '../home/home';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgIf, RouterModule, NgForOf, Home],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  encapsulation: ViewEncapsulation.None,
})
export class Navbar implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  items: any[] = [];

  mostrarConfirmLogout = false;
  isLoggedIn = false;
  mostrarFiltros = false;
  menuUsuarioAbierto = false;
  carritoAbierto = false;

  constructor(
    private eRef: ElementRef,
    private router: Router,
    private cartService: CartService,
    private userService: UserService,
    private filterService: FilterService,
  ) {}

  private onStorageChange = (event: StorageEvent) => {
    if (event.key === 'app_session_lock') {
      this.checkLogin();
    }
  };

  ngOnInit() {
    this.cartService.loadCart();

    this.cartService.cart$.subscribe((data) => {
      this.items = data;
    });

    this.checkLogin();

    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('storage', this.onStorageChange);
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('storage', this.onStorageChange);
    }
  }

  toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;

    if (this.mostrarFiltros) {
      this.menuUsuarioAbierto = false;
      this.carritoAbierto = false;
    }
  }

  toggleMenuUsuario() {
    this.menuUsuarioAbierto = !this.menuUsuarioAbierto;

    if (this.menuUsuarioAbierto) {
      this.mostrarFiltros = false;
      this.carritoAbierto = false;
    }
  }

  slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  logout() {
    this.mostrarConfirmLogout = true;
  }

  confirmarLogout() {
    this.userService.logout();
    this.cartService.clearCart();
    this.isLoggedIn = false;
    this.mostrarConfirmLogout = false;
    this.router.navigate(['/login']);
  }

  

  toggleCarrito() {
    this.carritoAbierto = !this.carritoAbierto;

    if (this.carritoAbierto) {
      this.mostrarFiltros = false;
      this.menuUsuarioAbierto = false;
    }
  }

  cerrarCarrito() {
    this.carritoAbierto = false;
  }

  @HostListener('document:click', ['$event'])
  clickFuera(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const clickDentroFiltros = target.closest('.search-box');
    const clickDentroUsuario = target.closest('.user-dropdown');
    const clickDentroCarrito = target.closest('.cart-panel');
    const clickIconCarrito = target.closest('.cart-icon');

    if (
      !clickDentroFiltros &&
      !clickDentroUsuario &&
      !clickDentroCarrito &&
      !clickIconCarrito
    ) {
      this.mostrarFiltros = false;
      this.menuUsuarioAbierto = false;
      this.carritoAbierto = false;
    }
  }

  checkLogin() {
    this.isLoggedIn = this.userService.isLoggedIn();
  }

  eliminar(index: number) {
    this.cartService.removeItem(index);
  }

  aumentar(item: any) {
    this.cartService.increase(item);
  }

  disminuir(item: any) {
    this.cartService.decrease(item);
  }

  getTotal() {
    return this.cartService.getTotal();
  }

  vaciar() {
    this.cartService.clearCart();
  }

  getCantidadTotal() {
    return this.items.reduce((acc, item) => acc + item.cantidad, 0);
  }

  selectCategory(category: string) {
    this.scrollToCategory(category);
  }

  scrollToCategory(category: string) {
    this.mostrarFiltros = false;

    const targetId =
      category === 'Todos'
        ? 'catalogo'
        : category
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

    this.router.navigate(['/']).then(() => {
      setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 80);
    });
  }
}