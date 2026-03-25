import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Invoice} from './invoice';

describe('InvoiceComponent', () => {
  let component: Invoice;
  let fixture: ComponentFixture<Invoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Invoice] // standalone
    }).compileComponents();

    fixture = TestBed.createComponent(Invoice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería calcular el total correctamente', () => {
    expect(component.getTotal()).toBe(180000);
  });

  it('debería calcular subtotal correctamente', () => {
    const item = { name: 'Test', quantity: 2, price: 10000 };
    expect(component.getSubtotal(item)).toBe(20000);
  });
});