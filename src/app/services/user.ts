import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class User {

}
export interface User {
  id: number;
  nombre: string;
  email: string;
  pais: string;
  ubicacion: string;
  fotoUrl: string;
  cantidadCompras: number;
}
