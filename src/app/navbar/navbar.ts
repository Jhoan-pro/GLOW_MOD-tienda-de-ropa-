import { Component, ViewEncapsulation, HostListener, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],  
  encapsulation: ViewEncapsulation.None
})
export class Navbar {

  mostrarFiltros = false;
  menuUsuarioAbierto: boolean = false;
  constructor(private eRef: ElementRef){}
  toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  toggleMenuUsuario() {
    this.menuUsuarioAbierto = !this.menuUsuarioAbierto;
  }

  logout() {
    console.log("Saliste de sesion");
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