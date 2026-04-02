import { Component, ViewEncapsulation } from '@angular/core';
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
  menuUsuarioAbierto = false;

  toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  toggleMenuUsuario() {
    this.menuUsuarioAbierto = !this.menuUsuarioAbierto;
  }

  logout() {
    console.log("Cerrar sesión");
  }
  carritoAbierto = false;

toggleCarrito() {
  this.carritoAbierto = !this.carritoAbierto;
}
}