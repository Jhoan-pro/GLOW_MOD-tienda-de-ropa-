import { normalizeRole } from './auth-api';

describe('normalizeRole', () => {
  it('convierte miembros del enum de Prisma al formato de la UI', () => {
    expect(normalizeRole('ADMIN')).toBe('admin');
    expect(normalizeRole('SUB_ADMIN')).toBe('sub-admin');
    expect(normalizeRole('CASHIER')).toBe('cashier');
    expect(normalizeRole('CLIENT')).toBe('client');
  });

  it('acepta valores ya normalizados', () => {
    expect(normalizeRole('sub-admin')).toBe('sub-admin');
    expect(normalizeRole('client')).toBe('client');
  });

  it('cae a client en valores desconocidos o vacíos', () => {
    expect(normalizeRole(undefined)).toBe('client');
    expect(normalizeRole('')).toBe('client');
    expect(normalizeRole('superadmin')).toBe('client');
  });
});
