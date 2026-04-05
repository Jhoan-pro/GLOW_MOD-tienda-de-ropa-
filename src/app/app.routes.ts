import { Routes } from '@angular/router';

import { Home } from './home/home';
import { Login } from './login/login';
import { RegisterUser } from './register-user/register-user';
import { ForgotPassword } from './forgot-password/forgot-password';

import { Admin } from './admin/admin';
import { Cashier } from './cashier/cashier';
import { Client } from './client/client';
import { UserProfile } from './user-profile/user-profile';
import { Cart } from './cart/cart';
import { Invoice } from './invoice/invoice';

import { ProductForm } from './product-form/product-form';

import { DashBoard } from './dash-board/dash-board';

// Nuevos componentes
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { Products } from './products/products';

export const routes: Routes = [

  // Inicio
  { path: '', component: Home },

  // Autenticación
  { path: 'login', component: Login },
  { path: 'register', component: RegisterUser },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'user', component: UserProfile },
  // Dashboard para usuarios normales
  {
    path: 'dashboard',
    component: DashBoard,
    children: [
      { path: 'cashier', component: Cashier },
      { path: 'client', component: Client },
      
    ]
  },

  // Dashboard de administrador
  {
    path: 'admin-dashboard',
    component: AdminDashboard,
    children: [
      { path: 'admin', component: Admin },
      { path: 'products', component: Products }
    ]
  },

  // Otros módulos
  { path: 'cart', component: Cart },
  { path: 'invoice', component: Invoice },

  // Temporal (puedes eliminarlo después)
  { path: 'product/new', component: ProductForm },

  // Redirección por defecto
  { path: '**', redirectTo: '' }
];