import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { OrderHistoryService } from '../services/order-history.service';
import { isPlatformBrowser } from '@angular/common';

type ErrorKeys =
  | 'customerName'
  | 'customerEmail'
  | 'phone'
  | 'address'
  | 'city'
  | 'documentId'
  | 'paymentMethod'
  | 'cardName'
  | 'cardNumber'
  | 'expiry'
  | 'cvv'
  | 'bank'
  | 'reference'
  | 'phoneWallet';

@Component({
  selector: 'app-cashier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cashier.html',
  styleUrls: ['./cashier.css'],
})
export class Cashier {
  private platformId = inject(PLATFORM_ID);
  private draftKeyPrefix = 'checkout_draft';
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
  loading = false;

  cardName = '';
  cardNumber = '';
  expiry = '';
  cvv = '';

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
  phoneWallet = '';
  private draftKey = 'checkout_draft';
  submitted = false;
  errors: Partial<Record<ErrorKeys, string>> = {};

  constructor(
    private cartService: CartService,
    private router: Router,
    private userService: UserService,
    private orderHistory: OrderHistoryService,
  ) {}

  ngOnInit() {
    this.cartService.loadCart();

    this.cartService.cart$.subscribe((data) => {
      this.items = data;
    });

    const user = this.userService.getCurrentUser();
    if (user) {
      this.customerEmail = user.email;
      this.customerName = user.name;
    }

    if (!this.isBrowser()) return;

    const draft = localStorage.getItem(this.getDraftKey());

    if (draft) {
      const data = JSON.parse(draft);

      this.customerName = data.customerName || this.customerName;
      this.customerEmail = data.customerEmail || this.customerEmail;
      this.phone = data.phone || '';
      this.address = data.address || '';
      this.city = data.city || '';
      this.documentId = data.documentId || '';
      this.paymentMethod = data.paymentMethod || '';
      this.cardName = data.cardName || '';
      this.cardNumber = data.cardNumber || '';
      this.expiry = data.expiry || '';
      this.cvv = data.cvv || '';
      this.bank = data.bank || '';
      this.reference = data.reference || '';
      this.phoneWallet = data.phoneWallet || '';
    }
  }

  getTotal() {
    return this.cartService.getTotal();
  }

  onPaymentChange() {
    this.cardName = '';
    this.cardNumber = '';
    this.expiry = '';
    this.cvv = '';
    this.bank = '';
    this.reference = '';
    this.phoneWallet = '';
    this.errors = {
      ...this.errors,
      paymentMethod: undefined,
      cardName: undefined,
      cardNumber: undefined,
      expiry: undefined,
      cvv: undefined,
      bank: undefined,
      reference: undefined,
      phoneWallet: undefined,
    };
  }

  normalizeLetters(value: string): string {
    return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').replace(/\s{2,}/g, ' ');
  }

  normalizeDigits(value: string): string {
    return value.replace(/\D/g, '');
  }

  normalizeAddress(value: string): string {
    return value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ#\-\.,\s]/g, '');
  }

  allowOnlyLetters(event: KeyboardEvent) {
    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];

    if (allowed.includes(event.key) || event.ctrlKey || event.metaKey) return;

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(event.key)) {
      event.preventDefault();
      this.mostrarAlerta('Solo se permiten letras y espacios', 'error');
    }
  }

  allowOnlyDigits(event: KeyboardEvent) {
    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];

    if (allowed.includes(event.key) || event.ctrlKey || event.metaKey) return;

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      this.mostrarAlerta('Solo se permiten números', 'error');
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  private isFutureOrCurrentExpiry(expiry: string): boolean {
    const match = expiry.trim().match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
    if (!match) return false;

    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return year > currentYear || (year === currentYear && month >= currentMonth);
  }

  private setError(key: ErrorKeys, message: string) {
    this.errors[key] = message;
  }

  validarFormulario(): boolean {
    this.errors = {};

    // Nombre
    if (!this.customerName.trim()) {
      this.setError('customerName', 'Nombre completo obligatorio. Ej: Juan Pérez');
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.customerName.trim())) {
      this.setError('customerName', 'Solo letras y espacios');
    } else if (this.customerName.trim().length < 3) {
      this.setError('customerName', 'Debe tener mínimo 3 caracteres');
    }

    // Email
    if (!this.customerEmail.trim()) {
      this.setError('customerEmail', 'Correo electrónico obligatorio. Ej: correo@dominio.com');
    } else if (!this.isValidEmail(this.customerEmail)) {
      this.setError('customerEmail', 'Correo inválido');
    }

    // Teléfono
    if (!this.phone.trim()) {
      this.setError('phone', 'Teléfono obligatorio. Ej: 3001234567');
    } else if (!/^\d{10}$/.test(this.phone)) {
      this.setError('phone', 'Debe tener exactamente 10 números');
    }

    // Dirección
    if (!this.address.trim()) {
      this.setError('address', 'Dirección obligatoria. Ej: Cra 12 # 34-56');
    } else if (this.address.trim().length < 5) {
      this.setError('address', 'La dirección es muy corta');
    } else if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ#\-\.,\s]+$/.test(this.address)) {
      this.setError('address', 'Solo letras, números y # - , .');
    }

    // Ciudad
    if (!this.city.trim()) {
      this.setError('city', 'Ciudad obligatoria. Ej: Popayán');
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.city.trim())) {
      this.setError('city', 'Solo letras y espacios');
    }

    // Documento
    if (!this.documentId.trim()) {
      this.setError('documentId', 'Documento obligatorio. Ej: 123456789');
    } else if (!/^\d{6,12}$/.test(this.documentId)) {
      this.setError('documentId', 'Solo números, entre 6 y 12 dígitos');
    }

    // Método de pago
    if (!this.paymentMethod) {
      this.setError('paymentMethod', 'Selecciona un método de pago');
    }

    // Validaciones por método
    if (this.paymentMethod === 'card') {
      if (!this.cardName.trim()) {
        this.setError('cardName', 'Nombre en la tarjeta obligatorio');
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.cardName.trim())) {
        this.setError('cardName', 'Solo letras y espacios');
      }

      if (!this.cardNumber.trim()) {
        this.setError('cardNumber', 'Número de tarjeta obligatorio');
      } else if (!/^\d{16}$/.test(this.cardNumber)) {
        this.setError('cardNumber', 'Debe tener 16 números');
      }

      if (!this.expiry.trim()) {
        this.setError('expiry', 'Fecha de vencimiento obligatoria. Ej: 12/29');
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(this.expiry)) {
        this.setError('expiry', 'Formato inválido. Usa MM/AA');
      } else if (!this.isFutureOrCurrentExpiry(this.expiry)) {
        this.setError('expiry', 'La tarjeta está vencida');
      }

      if (!this.cvv.trim()) {
        this.setError('cvv', 'CVV obligatorio');
      } else if (!/^\d{3}$/.test(this.cvv)) {
        this.setError('cvv', 'Debe tener 3 números');
      }
    }

    if (this.paymentMethod === 'transfer') {
      if (!this.bank) {
        this.setError('bank', 'Selecciona un banco');
      }

      if (!this.reference.trim()) {
        this.setError('reference', 'Referencia obligatoria');
      } else if (!/^[a-zA-Z0-9\-]+$/.test(this.reference.trim())) {
        this.setError('reference', 'Solo letras, números y guion');
      } else if (this.reference.trim().length < 4) {
        this.setError('reference', 'La referencia es muy corta');
      }
    }

    if (this.paymentMethod === 'wallet') {
      if (!this.phoneWallet.trim()) {
        this.setError('phoneWallet', 'Número de Nequi / Daviplata obligatorio');
      } else if (!/^\d{10}$/.test(this.phoneWallet)) {
        this.setError('phoneWallet', 'Debe tener 10 números');
      }
    }

    return Object.keys(this.errors).length === 0;
  }

  pagar() {
    if (this.loading) return;

    this.submitted = true;

    if (!this.validarFormulario()) {
      this.mostrarAlerta('Revisa los campos marcados en rojo', 'error');
      this.enfocarPrimerError();
      this.loading = false;
      return;
    }

    this.loading = true;

    const user = this.userService.getCurrentUser();

    const invoice = {
      invoiceNumber: 'INV-' + Date.now(),
      date: new Date(),
      customer: {
        name: this.customerName.trim(),
        email: this.customerEmail.trim(),
        phone: this.phone.trim(),
        address: this.address.trim(),
        city: this.city.trim(),
        documentId: this.documentId.trim(),
      },
      notes: this.notes.trim(),
      userId: user?.email,
      paymentMethod: this.paymentMethod,
      paymentDetails: {
        walletNumber: this.paymentMethod === 'wallet' ? this.phoneWallet.trim() : null,
        bank: this.paymentMethod === 'transfer' ? this.bank : null,
        reference: this.paymentMethod === 'transfer' ? this.reference.trim() : null,
        cardName: this.paymentMethod === 'card' ? this.cardName.trim() : null,
        cardNumberLast4: this.paymentMethod === 'card' ? this.cardNumber.slice(-4) : null,
      },
      items: this.items.map((item) => ({
        name: item.product.name,
        quantity: item.cantidad,
        price: item.product.price,
        ownerId: item.product.ownerId ?? null, 
      })),
      total: this.getTotal(),
    };

    if (this.isBrowser()) {
      localStorage.setItem('lastInvoice', JSON.stringify(invoice));
    }

    this.orderHistory.addOrder(invoice);

    this.clearDraft();
    this.cartService.finalizePurchase();

    this.mostrarAlerta('Pago realizado con éxito', 'success');

    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/invoice']);
    }, 1500);
  }

  enfocarPrimerError() {
    setTimeout(() => {
      const firstError = document.querySelector('.input-error') as HTMLElement | null;
      firstError?.focus();
    }, 0);
  }

  mostrarAlerta(msg: string, tipo: 'success' | 'error') {
    this.showAlert = false;

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

  cerrar() {
    this.router.navigate(['/home']);
  }
  saveDraft() {
    if (!this.isBrowser()) return;

    const draft = {
      customerName: this.customerName,
      customerEmail: this.customerEmail,
      phone: this.phone,
      address: this.address,
      city: this.city,
      documentId: this.documentId,
      paymentMethod: this.paymentMethod,
      cardName: this.cardName,
      cardNumber: this.cardNumber,
      expiry: this.expiry,
      cvv: this.cvv,
      bank: this.bank,
      reference: this.reference,
      phoneWallet: this.phoneWallet,
    };

    localStorage.setItem(this.getDraftKey(), JSON.stringify(draft));
  }
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private getDraftKey(): string {
    const user = this.userService.getCurrentUser();
    const userKey = user?.id ?? user?.email ?? 'guest';
    return `${this.draftKeyPrefix}_${userKey}`;
  }
  private clearDraft() {
    if (!this.isBrowser()) return;
    localStorage.removeItem(this.getDraftKey());
  }
}
