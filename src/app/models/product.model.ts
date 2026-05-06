export interface Product {
  id?: number;
  ownerId?: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  selected?: boolean;
  image?: string;
  added?: boolean;
}