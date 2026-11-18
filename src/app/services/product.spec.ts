import { TestBed } from '@angular/core/testing';
import { ProductService } from './product';

describe('ProductService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(TestBed.inject(ProductService)).toBeTruthy();
  });

  it('normalizes price and stock stored as strings', () => {
    localStorage.setItem(
      'products',
      JSON.stringify([{ name: 'Camisa', price: '25000', stock: '3', category: 'Camisas' }]),
    );

    const products = TestBed.inject(ProductService).products();
    expect(products[0].price).toBe(25000);
    expect(products[0].stock).toBe(3);
  });
});
