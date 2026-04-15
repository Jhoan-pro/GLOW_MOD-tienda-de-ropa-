import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { ChangeDetectorRef } from '@angular/core';
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
banks: string[] = [
  'Bancolombia',
  'Davivienda',
  'Banco de Bogotá',
  'BBVA',
  'Banco Popular',
  'Scotiabank Colpatria',
  'Banco Caja Social',
  'Banco Agrario',
  'Itaú',
  'Banco Falabella'
];
reference = '';

// wallet
phone = '';
  constructor(private cartService: CartService,private router: Router, private userService: UserService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
  this.cartService.cart$.subscribe(data => {
    this.items = data;
  });

  const user = this.userService.getCurrentUser();

  if (user) {
    this.customerEmail = user.email;
    this.customerName = user.fullName || '';
  }
}

  getTotal() {
    return this.cartService.getTotal();
  }

 pagar() {

  // VALIDAR CARRITO
  if (this.items.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  // VALIDAR DATOS CLIENTE
  if (!this.customerName.trim()) {
    alert("Nombre requerido");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.customerEmail)) {
    alert("Correo inválido");
    return;
  }

  // VALIDAR MÉTODO
  if (!this.paymentMethod) {
    alert("Selecciona método de pago");
    return;
  }

  // TARJETA
  if (this.paymentMethod === 'card') {

    if (!/^\d{16}$/.test(this.cardNumber)) {
      alert("La tarjeta debe tener 16 dígitos");
      return;
    }

    if (!this.cardName.trim()) {
      alert("Nombre en tarjeta requerido");
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(this.expiry)) {
      alert("Formato de fecha inválido (MM/AA)");
      return;
    }

    if (!/^\d{3}$/.test(this.cvv)) {
      alert("CVV inválido (3 dígitos)");
      return;
    }
  }

  // TRANSFERENCIA
  if (this.paymentMethod === 'transfer') {

    if (!this.bank) {
      alert("Selecciona un banco");
      return;
    }

    if (!this.reference.trim()) {
      alert("Referencia requerida");
      return;
    }
  }

  // WALLET (Nequi / Daviplata)
  if (this.paymentMethod === 'wallet') {

    if (!/^\d{10}$/.test(this.phone)) {
      alert("El número debe tener exactamente 10 dígitos");
      return;
    }
  }

  // Crear factura
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
    })),
    total: this.getTotal()
  };

  localStorage.setItem('lastInvoice', JSON.stringify(invoice));

  this.cartService.clearCart();

  alert("Pago realizado con éxito");

  this.router.navigate(['/invoice']);
}
  onPaymentChange() {
  console.log("Método:", this.paymentMethod);
  this.cdr.detectChanges();
}

}