import { Component } from '@angular/core';
import { Navbar } from "../navbar/navbar";

@Component({
  selector: 'app-home',
  imports: [Navbar],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  standalone:true
})
export class Home {

}
