import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  customerName: string;
  customerEmail: string;
  items: InvoiceItem[];
}

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice.html',
  styleUrls: ['./invoice.css'],
})
export class Invoice {

  invoice: InvoiceData = {
    invoiceNumber: 'INV-001',
    date: new Date(),
    customerName: 'Juan Pérez',
    customerEmail: 'juan.perez@example.com',
    items: [
      { name: 'Camisa Glow', quantity: 2, price: 50000 },
      { name: 'Pantalón Glow', quantity: 1, price: 80000 }
    ]
  };

  getSubtotal(item: InvoiceItem): number {
    return item.quantity * item.price;
  }

  getTotal(): number {
    return this.invoice.items.reduce(
      (acc, item) => acc + this.getSubtotal(item),
      0
    );
  }

  imprimirFactura() {
    window.print();
  }
}