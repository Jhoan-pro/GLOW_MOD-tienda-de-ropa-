import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-cashier',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './cashier.html',
  styleUrls: ['./cashier.css']
})
export class Cashier {

  items: any[] = [];

  customerName = '';
  customerEmail = '';
  paymentMethod='';
  // tarjeta
cardName = '';
cardNumber = '';
expiry = '';
cvv = '';

// transferencia
bank = '';
reference = '';

// wallet
phone = '';
  constructor(private cartService: CartService,private router: Router) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(data => {
      this.items = data;
    });
  }

  getTotal() {
    return this.cartService.getTotal();
  }

 pagar() {

  if (!this.customerName || !this.customerEmail) {
    alert("Completa tus datos");
    return;
  }

  if (!this.paymentMethod) {
    alert("Selecciona método de pago");
    return;
  }

  if (this.paymentMethod === 'card') {
    if (!this.cardNumber || !this.cardName || !this.expiry || !this.cvv) {
      alert("Completa datos de tarjeta");
      return;
    }
  }

  if (this.paymentMethod === 'transfer') {
    if (!this.bank || !this.reference) {
      alert("Completa datos de transferencia");
      return;
    }
  }

  if (this.paymentMethod === 'wallet') {
    if (!this.phone) {
      alert("Ingresa número de celular");
      return;
    }
  }

  const invoice = {
    invoiceNumber: 'INV-' + Date.now(),
    date: new Date(),
    customerName: this.customerName,
    customerEmail: this.customerEmail,
    paymentMethod: this.paymentMethod,
    items: this.items.map(item => ({
      name: item.product.name,
      quantity: item.cantidad,
      price: item.product.price
    }))
  };

  localStorage.setItem('lastInvoice', JSON.stringify(invoice));

  this.cartService.clearCart();

  this.router.navigate(['/invoice']);
}
  

}