import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfile implements OnInit {

  user: any = {};
  editMode: boolean = false;
  hasExtraInfo: boolean = false;

  errors: any = {};

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    const currentUser = this.userService.getCurrentUser();

    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.user = { ...currentUser };

    // Detecta si ya tiene info extra
    this.hasExtraInfo = !!this.user.fullName;
  }

  enableEdit() {
    this.editMode = true;
  }

  save() {
    this.errors = {};

    if (!this.user.fullName) this.errors.fullName = 'Nombre requerido';
    if (!this.user.address) this.errors.address = 'Dirección requerida';

    if (Object.keys(this.errors).length > 0) return;

    // Guardar cambios
    this.userService.login(this.user);

    this.editMode = false;
    this.hasExtraInfo = true;
  }

  volver() {
    this.router.navigate(['/home']);
  }
}
