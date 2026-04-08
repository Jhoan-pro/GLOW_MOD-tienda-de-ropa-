import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice.html',
  styleUrls: ['./invoice.css'],
})
export class Invoice {

  invoice: any;

  ngOnInit() {
    const data = localStorage.getItem('lastInvoice');
    if (data) {
      this.invoice = JSON.parse(data);
    }
  }

  getSubtotal(item: any): number {
    return item.quantity * item.price;
  }

  getTotal(): number {
    return this.invoice?.items?.reduce(
      (acc: number, item: any) => acc + this.getSubtotal(item),
      0
    ) || 0;
  }

  getMetodoPago() {
    switch (this.invoice?.paymentMethod) {
      case 'card': return 'Tarjeta';
      case 'transfer': return 'Transferencia';
      case 'paypal': return 'PayPal';
      case 'wallet': return 'Nequi / Daviplata';
      default: return '';
    }
  }

  imprimirFactura() {
    window.print();
  }
}