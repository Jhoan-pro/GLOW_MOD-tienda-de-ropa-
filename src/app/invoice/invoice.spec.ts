import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Order } from '../models/order.model';
import { Invoice } from './invoice';

const invoiceFixture: Order = {
  invoiceNumber: 'F-1',
  date: '2026-01-01T00:00:00.000Z',
  customer: {
    name: 'Cliente',
    email: 'cliente@test.com',
    phone: '3000000000',
    address: 'Calle 1',
    city: 'Medellín',
    documentId: '123456789',
  },
  notes: '',
  paymentMethod: 'card',
  paymentDetails: {
    walletNumber: null,
    bank: null,
    reference: null,
    cardName: null,
    cardNumberLast4: null,
  },
  items: [
    { name: 'Camisa', quantity: 2, price: 10000, ownerId: null },
    { name: 'Chaqueta', quantity: 1, price: 160000, ownerId: null },
  ],
  total: 180000,
};

describe('InvoiceComponent', () => {
  let component: Invoice;
  let fixture: ComponentFixture<Invoice>;

  beforeEach(async () => {
    localStorage.setItem('lastInvoice', JSON.stringify(invoiceFixture));

    await TestBed.configureTestingModule({
      imports: [Invoice],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Invoice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería calcular el total correctamente', () => {
    expect((component as any).total()).toBe(180000);
  });

  it('debería calcular subtotal correctamente', () => {
    const item = { name: 'Test', quantity: 2, price: 10000, ownerId: null };
    expect((component as any).getSubtotal(item)).toBe(20000);
  });
});
