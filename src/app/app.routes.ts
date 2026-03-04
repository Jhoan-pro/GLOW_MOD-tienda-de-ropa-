import { Routes } from '@angular/router';

import { Home } from './home/home';
import { Login } from './login/login';
import { RegisterUser } from './register-user/register-user';
import { ForgotPassword } from './forgot-password/forgot-password';
import { Admin } from './admin/admin';
import { Cashier } from './cashier/cashier';
import { Client } from './client/client';
import { Cart } from './cart/cart';
import { Invoice } from './invoice/invoice';
import { ProductForm } from './product-form/product-form';
import { DashBoard } from './dash-board/dash-board';

export const routes: Routes = [

  { path: '', component: Home },

  { path: 'login', component: Login },
  { path: 'register', component: RegisterUser },
  { path: 'forgot-password', component: ForgotPassword },

  {
    path: 'dashboard',
    component: DashBoard,
    children: [
      { path: 'admin', component: Admin },
      { path: 'cashier', component: Cashier },
      { path: 'client', component: Client }
    ]
  },

  { path: 'cart', component: Cart },
  { path: 'invoice', component: Invoice },
  { path: 'product/new', component: ProductForm },

  { path: '**', redirectTo: '' }
];