import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent {
  users: any[] = [];
  filteredUsers: any[] = [];
  selectedUser: any = null;
  userForm!: FormGroup;
  successMessage: string = '';

  constructor(private fb: FormBuilder, private service: UsersService) {}

  ngOnInit(): void {
    this.loadUsers();

    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      address: ['', Validators.required],
    });
  }

  // Load Users from LocalStorage
  loadUsers(): void {
    this.service.getUsers().subscribe((data) => {
      this.users = data;
      this.filteredUsers = data;
    });
  }

  filterUsers(searchTerm: string) {
    searchTerm = searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );
  }

  openModal(user: any) {
    this.selectedUser = user;
  }

  closeModal() {
    this.selectedUser = null;
  }

  deleteUser(userId: number) {
    this.users = this.users.filter((user) => user.id !== userId);
    this.filterUsers('');
  }

  // Handle form submission
  onSubmit() {
    if (this.userForm.valid) {
      console.log('User Data:', this.userForm.value);

      this.users.push(this.userForm.value);
      this.filteredUsers = [...this.users]; // Refresh filtered list

      this.successMessage = 'User added successfully!';
      setTimeout(() => (this.successMessage = ''), 3000);

      this.userForm.reset();
    }
    console.log(this.successMessage);
  }
}
