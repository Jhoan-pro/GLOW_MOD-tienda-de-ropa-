import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Order } from '../models/order.model';
import { CartService } from '../services/cart.service';
import { OrdersApi, ApiOrder, CreateOrderRequest } from '../services/orders-api';
import { AuthSession } from '../core/auth/auth-session';

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

type FormErrors = Partial<Record<ErrorKeys, string>>;

const LETTERS_ONLY = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAV_KEYS = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];

const DRAFT_KEY_PREFIX = 'checkout_draft';

@Component({
  selector: 'app-cashier',
  imports: [FormsModule],
  templateUrl: './cashier.html',
  styleUrl: './cashier.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cashier {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly session = inject(AuthSession);
  private readonly ordersApi = inject(OrdersApi);

  protected readonly items = this.cartService.items;
  protected readonly total = this.cartService.total;

  // Datos del cliente
  protected readonly customerName = signal('');
  protected readonly customerEmail = signal('');
  protected readonly phone = signal('');
  protected readonly address = signal('');
  protected readonly city = signal('');
  protected readonly documentId = signal('');
  protected readonly notes = signal('');

  // Pago
  protected readonly paymentMethod = signal('');
  protected readonly cardName = signal('');
  protected readonly cardNumber = signal('');
  protected readonly expiry = signal('');
  protected readonly cvv = signal('');
  protected readonly bank = signal('');
  protected readonly reference = signal('');
  protected readonly phoneWallet = signal('');

  protected readonly banks = [
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

  // Estado de la pantalla
  protected readonly submitted = signal(false);
  protected readonly errors = signal<FormErrors>({});
  protected readonly loading = signal(false);
  protected readonly showAlert = signal(false);
  protected readonly alertMessage = signal('');
  protected readonly alertType = signal<'success' | 'error'>('success');

  constructor() {
    this.cartService.loadCart();
    this.prefillFromUser();
    this.restoreDraft();
  }

  // ───────── Normalización de entrada ─────────

  protected normalizeLetters(value: string): string {
    return (value || '').replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').replace(/\s{2,}/g, ' ');
  }

  protected normalizeDigits(value: string): string {
    return (value || '').replace(/\D/g, '');
  }

  protected normalizeAddress(value: string): string {
    return (value || '').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ#\-\.,\s]/g, '');
  }

  protected allowOnlyLetters(event: KeyboardEvent): void {
    if (NAV_KEYS.includes(event.key) || event.ctrlKey || event.metaKey) return;

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(event.key)) {
      event.preventDefault();
      this.mostrarAlerta('Solo se permiten letras y espacios', 'error');
    }
  }

  protected allowOnlyDigits(event: KeyboardEvent): void {
    if (NAV_KEYS.includes(event.key) || event.ctrlKey || event.metaKey) return;

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      this.mostrarAlerta('Solo se permiten números', 'error');
    }
  }

  // ───────── Método de pago ─────────

  protected onPaymentChange(): void {
    this.cardName.set('');
    this.cardNumber.set('');
    this.expiry.set('');
    this.cvv.set('');
    this.bank.set('');
    this.reference.set('');
    this.phoneWallet.set('');

    this.errors.update((errors) => ({
      ...errors,
      paymentMethod: undefined,
      cardName: undefined,
      cardNumber: undefined,
      expiry: undefined,
      cvv: undefined,
      bank: undefined,
      reference: undefined,
      phoneWallet: undefined,
    }));
  }

  // ───────── Validación ─────────

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

  protected validarFormulario(): boolean {
    const errors: FormErrors = {};

    const customerName = this.customerName().trim();
    if (!customerName) {
      errors.customerName = 'Nombre completo obligatorio. Ej: Juan Pérez';
    } else if (!LETTERS_ONLY.test(customerName)) {
      errors.customerName = 'Solo letras y espacios';
    } else if (customerName.length < 3) {
      errors.customerName = 'Debe tener mínimo 3 caracteres';
    }

    const customerEmail = this.customerEmail().trim();
    if (!customerEmail) {
      errors.customerEmail = 'Correo electrónico obligatorio. Ej: correo@dominio.com';
    } else if (!EMAIL_REGEX.test(customerEmail)) {
      errors.customerEmail = 'Correo inválido';
    }

    const phone = this.phone();
    if (!phone.trim()) {
      errors.phone = 'Teléfono obligatorio. Ej: 3001234567';
    } else if (!/^\d{10}$/.test(phone)) {
      errors.phone = 'Debe tener exactamente 10 números';
    }

    const address = this.address();
    if (!address.trim()) {
      errors.address = 'Dirección obligatoria. Ej: Cra 12 # 34-56';
    } else if (address.trim().length < 5) {
      errors.address = 'La dirección es muy corta';
    } else if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ#\-\.,\s]+$/.test(address)) {
      errors.address = 'Solo letras, números y # - , .';
    }

    const city = this.city().trim();
    if (!city) {
      errors.city = 'Ciudad obligatoria. Ej: Popayán';
    } else if (!LETTERS_ONLY.test(city)) {
      errors.city = 'Solo letras y espacios';
    }

    const documentId = this.documentId();
    if (!documentId.trim()) {
      errors.documentId = 'Documento obligatorio. Ej: 123456789';
    } else if (!/^\d{6,12}$/.test(documentId)) {
      errors.documentId = 'Solo números, entre 6 y 12 dígitos';
    }

    const paymentMethod = this.paymentMethod();
    if (!paymentMethod) {
      errors.paymentMethod = 'Selecciona un método de pago';
    }

    if (paymentMethod === 'card') {
      const cardName = this.cardName().trim();
      if (!cardName) {
        errors.cardName = 'Nombre en la tarjeta obligatorio';
      } else if (!LETTERS_ONLY.test(cardName)) {
        errors.cardName = 'Solo letras y espacios';
      }

      const cardNumber = this.cardNumber();
      if (!cardNumber.trim()) {
        errors.cardNumber = 'Número de tarjeta obligatorio';
      } else if (!/^\d{16}$/.test(cardNumber)) {
        errors.cardNumber = 'Debe tener 16 números';
      }

      const expiry = this.expiry();
      if (!expiry.trim()) {
        errors.expiry = 'Fecha de vencimiento obligatoria. Ej: 12/29';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
        errors.expiry = 'Formato inválido. Usa MM/AA';
      } else if (!this.isFutureOrCurrentExpiry(expiry)) {
        errors.expiry = 'La tarjeta está vencida';
      }

      const cvv = this.cvv();
      if (!cvv.trim()) {
        errors.cvv = 'CVV obligatorio';
      } else if (!/^\d{3}$/.test(cvv)) {
        errors.cvv = 'Debe tener 3 números';
      }
    }

    if (paymentMethod === 'transfer') {
      if (!this.bank()) {
        errors.bank = 'Selecciona un banco';
      }

      const reference = this.reference().trim();
      if (!reference) {
        errors.reference = 'Referencia obligatoria';
      } else if (!/^[a-zA-Z0-9\-]+$/.test(reference)) {
        errors.reference = 'Solo letras, números y guion';
      } else if (reference.length < 4) {
        errors.reference = 'La referencia es muy corta';
      }
    }

    if (paymentMethod === 'wallet') {
      const phoneWallet = this.phoneWallet();
      if (!phoneWallet.trim()) {
        errors.phoneWallet = 'Número de Nequi / Daviplata obligatorio';
      } else if (!/^\d{10}$/.test(phoneWallet)) {
        errors.phoneWallet = 'Debe tener 10 números';
      }
    }

    this.errors.set(errors);
    return Object.keys(errors).length === 0;
  }

  // ───────── Pago ─────────

  protected async pagar(): Promise<void> {
    if (this.loading()) return;

    this.submitted.set(true);

    if (this.items().length === 0) {
      this.mostrarAlerta('Tu carrito está vacío o expiró por inactividad', 'error');
      this.loading.set(false);
      return;
    }

    if (!this.validarFormulario()) {
      this.mostrarAlerta('Revisa los campos marcados en rojo', 'error');
      this.enfocarPrimerError();
      this.loading.set(false);
      return;
    }

    const paymentMethod = this.paymentMethod();
    if (paymentMethod !== 'card' && paymentMethod !== 'transfer' && paymentMethod !== 'wallet') {
      this.mostrarAlerta('Método de pago no disponible', 'error');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);

    const request: CreateOrderRequest = {
      customerName: this.customerName().trim(),
      customerEmail: this.customerEmail().trim(),
      customerPhone: this.phone().trim(),
      customerAddress: this.address().trim(),
      customerCity: this.city().trim(),
      customerDocumentId: this.documentId().trim(),
      notes: this.notes().trim() || undefined,
      paymentMethod,
      cardName: paymentMethod === 'card' ? this.cardName().trim() : undefined,
      cardNumberLast4: paymentMethod === 'card' ? this.cardNumber().slice(-4) : undefined,
      bank: paymentMethod === 'transfer' ? this.bank() : undefined,
      reference: paymentMethod === 'transfer' ? this.reference().trim() : undefined,
      walletNumber: paymentMethod === 'wallet' ? this.phoneWallet().trim() : undefined,
      items: this.items().flatMap((item) =>
        item.product.id !== undefined
          ? [{ productId: item.product.id, quantity: item.cantidad }]
          : [],
      ),
    };

    try {
      const order = await firstValueFrom(this.ordersApi.create(request));
      const invoice = this.toInvoice(order);

      if (this.isBrowser()) {
        localStorage.setItem('lastInvoice', JSON.stringify(invoice));
      }

      this.clearDraft();
      this.cartService.finalizePurchase();

      this.mostrarAlerta('Pago realizado con éxito', 'success');

      setTimeout(() => {
        this.loading.set(false);
        this.router.navigate(['/invoice']);
      }, 1200);
    } catch (error) {
      console.error('No se pudo crear el pedido', error);
      this.loading.set(false);
      this.mostrarAlerta(
        'No se pudo completar el pedido. Verifica el stock e intenta de nuevo.',
        'error',
      );
    }
  }

  private toInvoice(order: ApiOrder): Order {
    const paymentMethod = this.paymentMethod();

    return {
      invoiceNumber: order.invoiceNumber,
      date: order.date,
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        address: order.customerAddress,
        city: order.customerCity,
        documentId: order.customerDocumentId,
      },
      notes: order.notes ?? '',
      userId: this.session.user()?.email,
      paymentMethod: order.paymentMethod as Order['paymentMethod'],
      paymentDetails: {
        walletNumber: paymentMethod === 'wallet' ? this.phoneWallet().trim() : null,
        bank: paymentMethod === 'transfer' ? this.bank() : null,
        reference: paymentMethod === 'transfer' ? this.reference().trim() : null,
        cardName: paymentMethod === 'card' ? this.cardName().trim() : null,
        cardNumberLast4: paymentMethod === 'card' ? this.cardNumber().slice(-4) : null,
      },
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        ownerId: item.ownerId,
      })),
      total: order.total,
    };
  }

  protected cerrar(): void {
    this.router.navigate(['/Home']);
  }

  private enfocarPrimerError(): void {
    setTimeout(() => {
      this.document.querySelector<HTMLElement>('.input-error')?.focus();
    }, 0);
  }

  private mostrarAlerta(msg: string, tipo: 'success' | 'error'): void {
    this.showAlert.set(false);

    setTimeout(() => {
      this.alertMessage.set(msg);
      this.alertType.set(tipo);
      this.showAlert.set(true);
    }, 50);

    setTimeout(() => {
      this.loading.set(false);
      this.showAlert.set(false);
    }, 3000);
  }

  // ───────── Borrador (localStorage) ─────────

  protected saveDraft(): void {
    if (!this.isBrowser()) return;

    const draft = {
      customerName: this.customerName(),
      customerEmail: this.customerEmail(),
      phone: this.phone(),
      address: this.address(),
      city: this.city(),
      documentId: this.documentId(),
      paymentMethod: this.paymentMethod(),
      cardName: this.cardName(),
      cardNumber: this.cardNumber(),
      expiry: this.expiry(),
      cvv: this.cvv(),
      bank: this.bank(),
      reference: this.reference(),
      phoneWallet: this.phoneWallet(),
    };

    localStorage.setItem(this.getDraftKey(), JSON.stringify(draft));
  }

  private prefillFromUser(): void {
    const user = this.session.user();
    if (!user) return;

    this.customerName.set(user.name || '');
    this.customerEmail.set(user.email || '');
  }

  private restoreDraft(): void {
    if (!this.isBrowser()) return;

    const raw = localStorage.getItem(this.getDraftKey());
    if (!raw) return;

    const data = JSON.parse(raw) as Partial<Record<string, string>>;

    this.customerName.update((current) => data['customerName'] || current);
    this.customerEmail.update((current) => data['customerEmail'] || current);
    this.phone.update((current) => data['phone'] || current);
    this.address.update((current) => data['address'] || current);
    this.city.update((current) => data['city'] || current);
    this.documentId.update((current) => data['documentId'] || current);
    this.paymentMethod.update((current) => data['paymentMethod'] || current);
    this.cardName.set(data['cardName'] || '');
    this.cardNumber.set(data['cardNumber'] || '');
    this.expiry.set(data['expiry'] || '');
    this.cvv.set(data['cvv'] || '');
    this.bank.set(data['bank'] || '');
    this.reference.set(data['reference'] || '');
    this.phoneWallet.set(data['phoneWallet'] || '');
  }

  private clearDraft(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(this.getDraftKey());
  }

  private getDraftKey(): string {
    const user = this.session.user();
    const userKey = user?.id ?? user?.email ?? 'guest';
    return `${DRAFT_KEY_PREFIX}_${userKey}`;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
