import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  private storageKey = 'customers';
  private paymentStorageKey = 'payments';

  // Add a new loan
  addLoan(loan: any): void {
    const loans = JSON.parse(localStorage.getItem('loans') || '[]');
    loan.id = Date.now(); // Unique loan ID
    loans.push(loan);
    localStorage.setItem('loans', JSON.stringify(loans));
    this.generateRepaymentSchedule(loan);
  }

  // Generate repayment schedule
  generateRepaymentSchedule(loan: any): void {
    const schedules = JSON.parse(localStorage.getItem('loanSchedules') || '{}');
    const monthlyPayment = this.calculateMonthlyPayment(
      loan.loanAmount,
      loan.interestRate,
      loan.duration
    );

    const schedule = Array.from({ length: loan.duration }, (_, index) => ({
      installmentNumber: index + 1,
      dueDate: new Date(new Date().setMonth(new Date().getMonth() + index + 1)),
      amount: monthlyPayment,
      status: 'Pending',
    }));

    schedules[loan.id] = schedule;
    localStorage.setItem('loanSchedules', JSON.stringify(schedules));
  }

  // Calculate monthly payment (Simple Interest)
  calculateMonthlyPayment(
    amount: number,
    rate: number,
    duration: number
  ): number {
    const interest = (amount * rate * duration) / 100;
    const totalAmount = amount + interest;
    return +(totalAmount / duration).toFixed(2);
  }

  // Fetch all loans
  getLoans(): any[] {
    return JSON.parse(localStorage.getItem('loans') || '[]');
  }

  // Payments
  getPayments(): any[] {
    return JSON.parse(localStorage.getItem(this.paymentStorageKey) || '[]');
  }

  addPayment(payment: any): void {
    const payments = this.getPayments();
    payments.push(payment);
    localStorage.setItem(this.paymentStorageKey, JSON.stringify(payments));
  }

  // Fetch Loan Schedule by Loan ID
  getLoanSchedule(loanId: number): any[] {
    const schedules = JSON.parse(localStorage.getItem('loanSchedules') || '{}');
    return schedules[loanId] || [];
  }

  updateLoanSchedule(loanId: number, schedule: any[]): void {
    const schedules = JSON.parse(localStorage.getItem('loanSchedules') || '{}');
    schedules[loanId] = schedule;
    localStorage.setItem('loanSchedules', JSON.stringify(schedules));
  }

  updateLoans(updatedLoans: any[]): void {
    localStorage.setItem('loans', JSON.stringify(updatedLoans));
  }

  // Get all customers from LocalStorage
  getCustomers(): any[] {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  // Get a customer by ID
  getCustomerById(id: number): any | null {
    return (
      this.getCustomers().find((customer: any) => customer.id === id) || null
    );
  }

  // Add a new customer
  addCustomer(customer: any): void {
    const customers = this.getCustomers();
    customer.id = customers.length + 1; // Auto-increment ID
    customers.push(customer);
    localStorage.setItem(this.storageKey, JSON.stringify(customers));
  }

  // Update an existing customer
  updateCustomer(updatedCustomer: any): void {
    const customers = this.getCustomers().map((customer: any) =>
      customer.id === updatedCustomer.id ? updatedCustomer : customer
    );
    localStorage.setItem(this.storageKey, JSON.stringify(customers));
  }

  // Delete a customer by ID
  deleteCustomer(id: number): void {
    const customers = this.getCustomers().filter(
      (customer: any) => customer.id !== id
    );
    localStorage.setItem(this.storageKey, JSON.stringify(customers));
  }
}
