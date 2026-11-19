import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { computed, signal } from '@angular/core';

import { Navbar } from './navbar';
import { AuthSession } from '../core/auth/auth-session';

// Stub con sesión de cajero ya iniciada (el AuthSession real no expone
// forma de fijar el usuario sin llamar a la API).
function cashierSessionStub() {
  const user = signal<Record<string, unknown> | null>({
    id: 1,
    name: 'Cajero',
    email: 'cashier@test.com',
    role: 'CASHIER',
    active: true,
  });
  return {
    user: user.asReadonly(),
    authenticated: computed(() => user() !== null),
    error: signal('').asReadonly(),
    hydrate: () => Promise.resolve(true),
    clear: () => user.set(null),
    reportError: () => {},
    authorizationHeader: () => 'Bearer test-token',
  };
}

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    if (!window.matchMedia) {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: () => ({
          matches: false,
          media: '',
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }),
      });
    }

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('abre el panel del carrito al hacer clic en el icono', async () => {
    const icon = fixture.nativeElement.querySelector('.cart-icon') as HTMLElement;
    icon.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const panel = fixture.nativeElement.querySelector('.cart-panel');
    expect(panel).toBeTruthy();
    expect(panel.classList.contains('open')).toBe(true);
    expect(component['carritoAbierto']()).toBe(true);
  });
});

describe('Navbar (sesión de cajero)', () => {
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    if (!window.matchMedia) {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: () => ({
          matches: false,
          media: '',
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }),
      });
    }

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthSession, useValue: cashierSessionStub() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    await fixture.whenStable();
  });

  it('el cajero ve el carrito y puede abrirlo', async () => {
    const icon = fixture.nativeElement.querySelector('.cart-icon') as HTMLElement;
    expect(icon).toBeTruthy();
    icon.click();
    await fixture.whenStable();

    const panel = fixture.nativeElement.querySelector('.cart-panel');
    expect(panel.classList.contains('open')).toBe(true);
  });
});
