import { Component } from '@angular/core';
import { Home } from '../home/home';
import { Navbar } from '../navbar/navbar';
@Component({
  selector: 'app-client',
  imports: [Home, Navbar],
  templateUrl: './client.html',
  styleUrl: './client.css',
})
export class Client {

}
