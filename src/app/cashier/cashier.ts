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
  
  phone = '';



  address = '';
  city = '';
  documentId = '';
  notes = '';
  paymentMethod = '';
  alertMessage = '';
  alertType: 'success' | 'error' = 'success';
  showAlert = false;
  // tarjeta
  cardName = '';
  cardNumber = '';
  expiry = '';
  cvv = '';
  loading = false;
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
  phoneWallet = '';
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
    this.phoneWallet = '';
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
      this.customerName = user.name;
    }
  }

  getTotal() {
    return this.cartService.getTotal();
  }

  updateProductStock() {
  const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');

  const updatedProducts = storedProducts.map((p: any) => {

    const item = this.items.find(i => i.product.id === p.id);

    if (item) {
      return {
        ...p,
        stock: p.stock - item.cantidad
      };
    }

    return p;
  });

  localStorage.setItem('products', JSON.stringify(updatedProducts));
}


  pagar() {

  if (this.loading) return;

  this.loading = true;

  const user = this.userService.getCurrentUser();

  //VALIDACIÓN GLOBAL PRIMERO
  if (!this.validarCamposVacios()) {
    this.mostrarAlerta('Primero debes completar todos los campos obligatorios', 'error');
    this.enfocarPrimerError();
    this.loading = false;
    return;
  }

  // VALIDACIONES ESPECÍFICAS

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.customerName)) {
    this.mostrarAlerta('Nombre: solo letras y espacios', 'error');
    this.loading = false;
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.customerEmail)) {
    this.mostrarAlerta('Correo inválido', 'error');
    this.loading = false;
    return;
  }

  if (!/^\d{10}$/.test(this.phone)) {
    this.mostrarAlerta('Teléfono: 10 números', 'error');
    this.loading = false;
    return;
  }

  if (!/^[a-zA-Z0-9#\-\.\,\s]+$/.test(this.address)) {
    this.mostrarAlerta('Dirección inválida (# - , . permitidos)', 'error');
    this.loading = false;
    return;
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.city)) {
    this.mostrarAlerta('Ciudad inválida', 'error');
    this.loading = false;
    return;
  }
  // VALIDAR WALLET SOLO SI ES ESE MÉTODO
if (this.paymentMethod === 'wallet') {
  if (!/^\d{10}$/.test(this.phoneWallet)) {
    this.mostrarAlerta('Número de Nequi/Daviplata inválido (10 dígitos)', 'error');
    this.loading = false;
    return;
  }
}
  if (!this.paymentMethod) {
    this.mostrarAlerta('Selecciona método de pago', 'error');
    this.loading = false;
    return;
  }

  // CREAR FACTURA

  const invoice = {
  invoiceNumber: 'INV-' + Date.now(),
  date: new Date(),

  customer: {
    name: this.customerName,
    email: this.customerEmail,
    phone: this.phone,
    address: this.address,
    city: this.city,
    documentId: this.documentId
  },

  notes: this.notes,
  userId: user?.email,
  paymentMethod: this.paymentMethod,

  paymentDetails: {
    walletNumber: this.paymentMethod === 'wallet' ? this.phoneWallet : null,
    bank: this.paymentMethod === 'transfer' ? this.bank : null,
    reference: this.paymentMethod === 'transfer' ? this.reference : null,
    cardName: this.paymentMethod === 'card' ? this.cardName : null,
    cardNumberLast4: this.paymentMethod === 'card' ? this.cardNumber.slice(-4) : null
  },

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
  this.updateProductStock();
  this.cartService.clearCart();

  this.mostrarAlerta('Pago realizado con éxito', 'success');

  setTimeout(() => {
    this.loading = false;
    this.router.navigate(['/invoice']);
  }, 1500);
}
  enfocarPrimerError() {
    const campos = document.querySelectorAll('input, select');

    for (let campo of campos) {
      if (!(campo as HTMLInputElement).value) {
        (campo as HTMLElement).focus();
        break;
      }
    }
  }
  mostrarAlerta(msg: string, tipo: 'success' | 'error') {
    this.showAlert = false; // reset

    setTimeout(() => {
      this.alertMessage = msg;
      this.alertType = tipo;
      this.showAlert = true;
    }, 50);

    setTimeout(() => {
      this.loading = false;
      this.showAlert = false;
    }, 3000);
  }
  validarCamposVacios(): boolean {
  return (
    this.customerName.trim() !== '' &&
    this.customerEmail.trim() !== '' &&
    this.phone.trim() !== '' &&
    this.address.trim() !== '' &&
    this.city.trim() !== '' &&
    this.paymentMethod !== ''
  );
}
cerrar() {
    this.router.navigate(['/home']);
  }
}
