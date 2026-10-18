import { CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Order, OrderItem } from '../models/order.model';

const PAYMENT_LABELS: Record<string, string> = {
  card: 'Tarjeta',
  transfer: 'Transferencia',
  paypal: 'PayPal',
  wallet: 'Nequi / Daviplata',
};

@Component({
  selector: 'app-invoice',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './invoice.html',
  styleUrl: './invoice.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Invoice {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly invoice = signal<Order | null>(this.loadInvoice());

  protected readonly total = computed(
    () => this.invoice()?.items?.reduce((acc, item) => acc + this.getSubtotal(item), 0) ?? 0,
  );

  protected readonly metodoPago = computed(
    () => PAYMENT_LABELS[this.invoice()?.paymentMethod ?? ''] ?? '',
  );

  protected getSubtotal(item: OrderItem): number {
    return item.quantity * item.price;
  }

  protected imprimirFactura(): void {
    window.print();
  }

  protected irHome(): void {
    this.router.navigate(['/Navbar']);
  }

  private loadInvoice(): Order | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const data = localStorage.getItem('lastInvoice');
    return data ? (JSON.parse(data) as Order) : null;
  }
}
