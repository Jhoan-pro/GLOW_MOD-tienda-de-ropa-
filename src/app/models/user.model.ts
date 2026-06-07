export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'sub-admin' | 'cashier' | 'client';
  active: boolean;

  fullName?: string;
  phone?: string;
  city?: string;
  address?: string;
  birthDate?: string;
  idNumber?: string;
  country?: string;
  photo?: string;
}