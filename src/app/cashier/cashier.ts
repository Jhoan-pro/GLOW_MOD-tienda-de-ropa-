import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';

import { OrderHistoryService } from '../services/order-history.service';

@Component({
  selector: 'app-cashier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cashier.html',
  styleUrls: ['./cashier.css'],
})
export class Cashier {
  items: any[] = [];

  customerName = '';
  customerEmail = '';
  paymentMethod = '';
  alertMessage = '';
  alertType: 'success' | 'error' = 'success';
  showAlert = false;
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
    'Banco Falabella',
  ];
  reference = '';

  // wallet
  phone = '';
  onPaymentChange() {
  // Limpiar todos los campos al cambiar método

  // tarjeta
  this.cardName = '';
  this.cardNumber = '';
  this.expiry = '';
  this.cvv = '';

  // transferencia
  this.bank = '';
  this.reference = '';

  // wallet
  this.phone = '';
}
  constructor(
    private cartService: CartService,
    private router: Router,
    private userService: UserService,
    private orderHistory: OrderHistoryService,
  ) {}

  ngOnInit() {
    this.cartService.cart$.subscribe((data) => {
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

  if (this.items.length === 0) {
    this.mostrarAlerta('El carrito está vacío', 'error');
    return;
  }

  if (!this.customerName.trim()) {
    this.mostrarAlerta('Nombre requerido', 'error');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.customerEmail)) {
    this.mostrarAlerta('Correo inválido', 'error');
    return;
  }

  if (!this.paymentMethod) {
    this.mostrarAlerta('Selecciona método de pago', 'error');
    return;
  }

  if (this.paymentMethod === 'card') {

    if (!/^\d{16}$/.test(this.cardNumber)) {
      this.mostrarAlerta('La tarjeta debe tener 16 dígitos', 'error');
      return;
    }

    if (!this.cardName.trim()) {
      this.mostrarAlerta('Nombre en tarjeta requerido', 'error');
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(this.expiry)) {
      this.mostrarAlerta('Formato de fecha inválido (MM/AA)', 'error');
      return;
    }

    if (!/^\d{3}$/.test(this.cvv)) {
      this.mostrarAlerta('CVV inválido (3 dígitos)', 'error');
      return;
    }
  }

  if (this.paymentMethod === 'transfer') {

    if (!this.bank) {
      this.mostrarAlerta('Selecciona un banco', 'error');
      return;
    }

    if (!this.reference.trim()) {
      this.mostrarAlerta('Referencia requerida', 'error');
      return;
    }
  }

  if (this.paymentMethod === 'wallet') {

    if (!/^\d{10}$/.test(this.phone)) {
      this.mostrarAlerta('El número debe tener 10 dígitos', 'error');
      return;
    }
  }

  const user = this.userService.getCurrentUser();

  const invoice = {
    invoiceNumber: 'INV-' + Date.now(),
    date: new Date(),
    customerName: this.customerName,
    customerEmail: this.customerEmail,
    userId: user?.email,
    paymentMethod: this.paymentMethod,
    items: this.items.map(item => ({
      name: item.product.name,
      quantity: item.cantidad,
      price: item.product.price
    })),
    total: this.getTotal()
  };

  localStorage.setItem('lastInvoice', JSON.stringify(invoice));
  this.orderHistory.addOrder(invoice);
  this.cartService.clearCart();

  this.mostrarAlerta('Pago realizado con éxito', 'success');

  setTimeout(() => {
    this.router.navigate(['/invoice']);
  }, 1500);
}
mostrarAlerta(msg: string, tipo: 'success' | 'error') {
  this.showAlert = false; // reset

  setTimeout(() => {
    this.alertMessage = msg;
    this.alertType = tipo;
    this.showAlert = true;
  }, 50);

  setTimeout(() => {
    this.showAlert = false;
  }, 3000);
}
}
