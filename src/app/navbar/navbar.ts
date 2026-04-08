import { Component, ViewEncapsulation, HostListener, ElementRef } from '@angular/core';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { NgForOf, NgIf } from '@angular/common';
import { CartService } from '../services/cart.service';

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
  



  mostrarFiltros = false;
  menuUsuarioAbierto: boolean = false;
  constructor(private eRef: ElementRef, private router:Router,private cartService: CartService){}
  toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  toggleMenuUsuario() {
    this.menuUsuarioAbierto = !this.menuUsuarioAbierto;
  }

  logout() {
    const confirmacion = confirm('¿Seguro que deseas cerrar sesión?');

    if (confirmacion) {
      this.router.navigate(['/login']);
    }
  }
  carritoAbierto = false;

  toggleCarrito() {
  this.carritoAbierto = !this.carritoAbierto;
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
  this.cartService.cart$.subscribe(data => {
    this.items = data;
  });
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
}