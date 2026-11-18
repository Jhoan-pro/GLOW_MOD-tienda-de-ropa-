import { cartGuard } from './cart';

describe('cartGuard', () => {
  it('debe estar definido', () => {
    expect(typeof cartGuard).toBe('function');
  });
});
