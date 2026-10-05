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

import { Navbar } from './navbar/navbar';

// Nuevos componentes
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { Products } from './products/products';
import { UserManagement } from './user-management/user-management';
import { cartGuard } from './cart/cart';
import { AdminOrders } from './admin-orders/admin-orders';

import { authGuard } from './core/auth/auth-guard';
import { roleGuard } from './core/auth/role-guard';

export const routes: Routes = [
  // Inicio (público)
  { path: 'Home', component: Home },
  { path: 'Navbar', component: Navbar },
  { path: 'categoria/:nombre', component: Home },

  // Autenticación (público)
  { path: 'login', component: Login },
  { path: 'register', component: RegisterUser },
  { path: 'forgot-password', component: ForgotPassword },

  // Requiere estar logueado (cualquier rol)
  { path: 'user', component: UserProfile, canActivate: [authGuard] },
  { path: 'invoice', component: Invoice, canActivate: [authGuard] },

  // Solo admin y sub-admin
  {
    path: 'product/new',
    component: ProductForm,
    canActivate: [roleGuard],
    data: { roles: ['admin', 'sub-admin'] },
  },

  // Dashboard de administrador (admin + sub-admin)
  {
    path: 'admin-dashboard',
    component: AdminDashboard,
    canActivate: [roleGuard],
    data: { roles: ['admin', 'sub-admin'] },
    children: [
      { path: 'admin', component: Admin },
      { path: 'products', component: Products },
      {
        // Gestión de usuarios: más restrictivo que el resto del dashboard
        path: 'users',
        component: UserManagement,
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
      },
      { path: 'admin-orders', component: AdminOrders },

      { path: 'dashBoard', component: Home },
      { path: 'client', component: Client },
      { path: 'Navbar', component: Navbar },
    ],
  },

  // Caja: cashier y admin, y solo si hay items en el carrito
  {
    path: 'cashier',
    component: Cashier,
    canActivate: [cartGuard, roleGuard],
    data: { roles: ['cashier', 'admin'] },
  },

  { path: '**', redirectTo: 'Navbar' },
];
