import { Component, ViewEncapsulation, HostListener, ElementRef } from '@angular/core';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { NgForOf, NgIf } from '@angular/common';
import { CartService } from '../services/cart.service';
import { UserService } from '../services/user.service';
import { FilterService } from '../services/filter.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgIf, RouterModule, NgForOf],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  encapsulation: ViewEncapsulation.None
})
export class Navbar {
  items:any[]=[];



  isLoggedIn: boolean = false;
  mostrarFiltros = false;
  menuUsuarioAbierto: boolean = false;
  constructor(private eRef: ElementRef, private router:Router,private cartService: CartService, private userService: UserService,private filterService: FilterService){

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
  const confirmacion = window.confirm('¿Cerrar sesión?');

  if (confirmacion) {
    this.userService.logout();
    this.cartService.loadCart();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
  carritoAbierto = false;

  toggleCarrito() {
  this.carritoAbierto = !this.carritoAbierto;

  if (this.carritoAbierto) {
    this.mostrarFiltros = false;
    this.menuUsuarioAbierto = false;
  }
}
  cerrarCarrito(){
    this.carritoAbierto=false;
  }
  //Detecta clics
  @HostListener('document: click', ['$event'])
  clickFuera(event: Event){
    if(!this.eRef.nativeElement.contains(event.target)){
      this.menuUsuarioAbierto=false;
      this.mostrarFiltros = false;
      this.carritoAbierto= false;
    }
  }
  ngOnInit() {
  this.cartService.loadCart();

  this.cartService.cart$.subscribe(data => {
    this.items = data;
  });

  this.checkLogin();
}

checkLogin() {
  this.isLoggedIn = this.userService.isLoggedIn();
}
  eliminar(index: number){
    this.cartService.removeItem(index);
  }
  aumentar(item: any){
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
ngDoCheck() {
  this.checkLogin();
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
        block: 'start'
      });
    }, 80);
  });
}

}
