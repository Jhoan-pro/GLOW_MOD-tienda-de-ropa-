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
  styleUrl: './user-management.css' 
})
export class UserManagement implements OnInit {
  
  users: User[] = [];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.users = this.userService.getUsers();
  }

  deleteUser(index: number) {
    const confirmacion = confirm('¿Estás seguro de eliminar este usuario?');
    
    if (confirmacion) {
      const allUsers = this.userService.getUsers();
      allUsers.splice(index, 1);
      
      // Actualizamos el localStorage 
      localStorage.setItem('app_users', JSON.stringify(allUsers));
      
      // Refrescamos la vista
      this.loadUsers();
    }
  }

 
  changeRole(index: number, newRole: string) {
    const allUsers = this.userService.getUsers();
    allUsers[index].role = newRole;
    localStorage.setItem('app_users', JSON.stringify(allUsers));
    this.loadUsers();
  }
}