import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServicesService } from '../../services.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css'],
})
export class CustomerComponent {
  customerForm!: FormGroup;
  customers: any[] = [];
  editingCustomerId: number | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(private fb: FormBuilder, private service: ServicesService) {}

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      dateOfRegistration: ['', Validators.required],
      customerType: ['', Validators.required],
      profilePicture: [''],
    });

    this.loadCustomers();
  }

  // Load customers from LocalStorage
  loadCustomers(): void {
    this.customers = this.service.getCustomers();
  }

  // Add or Update Customer
  saveCustomer(): void {
    if (this.customerForm.invalid) return;

    const customerData = {
      id: this.editingCustomerId || Date.now(),
      ...this.customerForm.value,
    };

    if (this.editingCustomerId) {
      this.service.updateCustomer(customerData);
    } else {
      this.service.addCustomer(customerData);
    }

    this.loadCustomers();
    this.customerForm.reset();
    this.editingCustomerId = null;
  }

  // Load customer data into the form for editing
  editCustomer(customer: any): void {
    this.editingCustomerId = customer.id;
    this.customerForm.patchValue(customer);
    this.imagePreview = customer.profilePicture;
  }

  // Delete customer
  deleteCustomer(id: number): void {
    this.service.deleteCustomer(id);
    this.loadCustomers();
  }

  // Convert to Base64 for profile picture
  convertToBase64(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imagePreview = reader.result; // Preview the image
        this.customerForm.patchValue({ profilePicture: reader.result }); // Save to form
      };
    }
  }
}
