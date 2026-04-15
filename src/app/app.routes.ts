import { Routes } from '@angular/router';

import { Home } from './home/home';
import { Login } from './login/login';
import { RegisterUser } from './register-user/register-user';
import { ForgotPassword } from './forgot-password/forgot-password';

import { Admin } from './admin/admin';
import { Cashier } from './cashier/cashier';
import { Client } from './client/client';
import { UserProfile } from './user-profile/user-profile';

import { Invoice } from './invoice/invoice';

import { ProductForm } from './product-form/product-form';

import { DashBoard } from './dash-board/dash-board';

// Nuevos componentes
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { Products } from './products/products';
import { UserManagement } from './user-management/user-management';
import { cartGuard } from './cart/cart';
import { AdminOrders } from './admin-orders/admin-orders';
export const routes: Routes = [

  // Inicio
  { path: 'Home', component: Home },

  // Autenticación
  { path: 'login', component: Login },
  { path: 'register', component: RegisterUser },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'user', component: UserProfile },
  { path: 'categoria/:nombre', component: Home },

  // Dashboard para usuarios normales
  {
    path: 'dashboard',
    component: DashBoard,
    children: [
      
      { path: 'client', component: Client },

    ]
  },

  // Dashboard de administrador
  {
    path: 'admin-dashboard',
    component: AdminDashboard,
    children: [
      { path: 'admin', component: Admin },
      { path: 'products', component: Products },
      { path: 'users', component: UserManagement },
      { path: 'dashBoard', component: Home },
      { path: 'admin-orders', component: AdminOrders },

    ]
  },

  // Otros módulos
  
  { path: 'invoice', component: Invoice },
  { path: 'cashier', component: Cashier },
  // Temporal (puedes eliminarlo después)
  { path: 'product/new', component: ProductForm },
  { 
  path: 'cashier', 
  component: Cashier,
  canActivate: [cartGuard]
},

 { path: '**', redirectTo: 'Home' }
];