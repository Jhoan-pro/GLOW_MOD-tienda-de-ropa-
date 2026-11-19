import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AdminOrders } from './admin-orders';

describe('AdminOrders', () => {
  let component: AdminOrders;
  let fixture: ComponentFixture<AdminOrders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOrders],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminOrders);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
