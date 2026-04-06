import { Component, ViewEncapsulation, HostListener, ElementRef } from '@angular/core';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgIf, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],  
  encapsulation: ViewEncapsulation.None
})
export class Navbar {

  mostrarFiltros = false;
  menuUsuarioAbierto: boolean = false;
  constructor(private eRef: ElementRef, private router:Router){}
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
  //Detecta clics
  @HostListener('document: click', ['$event'])
  clickFuera(event: Event){
    if(!this.eRef.nativeElement.contains(event.target)){
      this.menuUsuarioAbierto=false;
    }
  }
}