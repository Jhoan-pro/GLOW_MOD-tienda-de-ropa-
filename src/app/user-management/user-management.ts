import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagement implements OnInit {
  users: User[] = [];
  editingUser: User | null = null;
  showEditModal: boolean = false;

  name: string = '';
  email: string = '';

  roleLabels: any = {
    admin: 'Administrador',
    cashier: 'Cajero',
    client: 'Cliente',
  };

  errors: any = {
    email: '',
    password: '',
    confirmPassword: '',
    general: '',
  };

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.users = this.userService.getUsers();
  }

  toggleStatus(index: number) {
    const allUsers = this.userService.getUsers();

    allUsers[index].active = !allUsers[index].active;
    this.saveAndRefresh(allUsers);
  }

  openEdit(user: User) {
    this.errors = { email: '', password: '', confirmPassword: '', general: '' };
    this.editingUser = { ...user };
    this.showEditModal = true;
  }

  saveEdit() {
    if (this.editingUser) {
      this.errors.email = '';
      this.errors.general = '';
      const allUsers = this.userService.getUsers();
      const emailExiste = allUsers.some(
        (u) =>
          u.email.toLowerCase() === this.editingUser?.email.toLowerCase() &&
          u.id !== this.editingUser?.id,
      );

      if (emailExiste) {
        this.errors.email = 'Este correo ya está en uso por otro usuario.';
        return;
      }

      if (!this.editingUser.name?.trim() || !this.editingUser.email?.trim()) {
        this.errors.general = 'El nombre y el correo no pueden estar vacíos.';
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(this.email)) {
        this.errors.email = 'Correo electrónico inválido. ej: ejemplo@gmail.com';
        return;
      }

      const index = allUsers.findIndex((u) => u.id === this.editingUser?.id);
      if (index !== -1) {
        allUsers[index] = this.editingUser;
        this.saveAndRefresh(allUsers);
        this.showEditModal = false;
      }
    }
  }

  private saveAndRefresh(updatedUsers: User[]) {
    localStorage.setItem('app_users', JSON.stringify(updatedUsers));
    this.loadUsers();
  }

  changeRole(index: number, newRole: string) {
    const allUsers = this.userService.getUsers();
    allUsers[index].role = newRole;
    localStorage.setItem('app_users', JSON.stringify(allUsers));
    this.loadUsers();
  }
}
