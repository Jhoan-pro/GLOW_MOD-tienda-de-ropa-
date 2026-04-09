export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string; 
  role: string;    
  active : boolean;  

  fullName?: string;
  address?: string;
  birthDate?: string;
  idNumber?: string;
  country?: string;
}