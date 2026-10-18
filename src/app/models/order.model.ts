export type PaymentMethod = 'card' | 'transfer' | 'paypal' | 'wallet';
export type OrderStatus = 'Completado' | 'Pendiente' | 'Cancelado';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  ownerId: number | null;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  documentId: string;
}

export interface PaymentDetails {
  walletNumber: string | null;
  bank: string | null;
  reference: string | null;
  cardName: string | null;
  cardNumberLast4: string | null;
}

/** Pedido / factura. `date` es Date al crearlo y string ISO al leerlo de localStorage. */
export interface Order {
  invoiceNumber: string;
  date: Date | string;
  customer: OrderCustomer;
  notes: string;
  userId?: string;
  paymentMethod: PaymentMethod | '';
  paymentDetails: PaymentDetails;
  items: OrderItem[];
  total: number;
  status?: OrderStatus;
}
