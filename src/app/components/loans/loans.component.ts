import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServicesService } from '../../services.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-loans',
  templateUrl: './loans.component.html',
  styleUrls: ['./loans.component.css'],
})
export class LoansComponent implements OnInit {
  loanForm!: FormGroup;
  makePaymentForm!: FormGroup;

  customers: any[] = [];
  loans: any[] = [];
  schedule: any[] = [];
  payments: any[] = [];
  filteredSchedule: any[] = [];

  selectedLoanId: number | null = null;
  showPaymentModal: boolean = false;

  constructor(
    private fb: FormBuilder,
    private service: ServicesService,
    private cdr: ChangeDetectorRef // Add this
  ) {}

  ngOnInit(): void {
    // Initialize Loan Form
    this.loanForm = this.fb.group({
      customerId: ['', Validators.required],
      loanType: ['', Validators.required],
      loanAmount: ['', [Validators.required, Validators.min(100)]],
      interestRate: ['', [Validators.required, Validators.min(1)]],
      duration: ['', [Validators.required, Validators.min(1)]],
    });

    // Initialize Payment Form
    this.makePaymentForm = this.fb.group({
      loanId: ['', Validators.required],
      installmentNumber: ['', Validators.required],
      amountPaid: ['', [Validators.required, Validators.min(1)]],
      paymentDate: ['', Validators.required],
    });

    this.loadCustomers();
    this.loadLoans();
    this.loadPayments();
  }

  onLoanSelect(loanId: number): void {
    this.filteredSchedule = this.service.getLoanSchedule(+loanId);
    console.log('Filtered Schedule:', this.filteredSchedule);
  }

  // Load Customers from LocalStorage
  loadCustomers(): void {
    this.customers = this.service.getCustomers();
  }

  // Load Loans from LocalStorage
  loadLoans(): void {
    this.loans = this.service.getLoans();
  }

  // Load Payments from LocalStorage
  loadPayments(): void {
    this.payments = this.service.getPayments();
  }

  // Apply for a Loan
  applyLoan(): void {
    if (this.loanForm.invalid) return;

    const loanData = {
      ...this.loanForm.value,
      status: 'Pending',
      date: new Date(),
    };

    this.service.addLoan(loanData);
    this.loadLoans();
    this.loanForm.reset();
  }

  // View Loan Repayment Schedule
  viewRepaymentSchedule(loanId: number): void {
    this.selectedLoanId = loanId;
    this.schedule = this.service.getLoanSchedule(loanId);
  }

  // Mark Installment as Paid
  markAsPaid(installmentNumber: number): void {
    const updatedSchedule = this.schedule.map((item) =>
      item.installmentNumber === installmentNumber
        ? { ...item, status: 'Paid' }
        : item
    );

    this.service.updateLoanSchedule(this.selectedLoanId!, updatedSchedule);
    this.viewRepaymentSchedule(this.selectedLoanId!); // Refresh
  }

  // Open Payment Modal
  openPaymentModal(): void {
    this.showPaymentModal = true;
  }

  openPaymentModalWithLoanId(loanId: number): void {
    this.makePaymentForm.patchValue({
      loanId: loanId,
    });
    this.filteredSchedule = this.service.getLoanSchedule(loanId); // Filter schedule for this loan
    this.showPaymentModal = true; // Open modal
  }

  openPaymentModalWithInstallment(
    loanId: number,
    installmentNumber: number,
    amount: number
  ): void {
    this.makePaymentForm.patchValue({
      loanId: loanId,
      installmentNumber: installmentNumber,
      amountPaid: amount,
    });

    this.showPaymentModal = true; // Open the modal
  }

  // Close Payment Modal
  closePaymentModal(): void {
    this.showPaymentModal = false;
  }

  // Make Payment
  makePayment() {
    const paymentData = this.makePaymentForm.value;

    const selectedInstallment = this.schedule.find(
      (item) => item.installmentNumber === paymentData.installmentNumber
    );

    if (selectedInstallment) {
      selectedInstallment.status = 'Paid';
    }

    // Persist the updated schedule to LocalStorage
    this.service.updateLoanSchedule(this.selectedLoanId!, this.schedule);

    // Check if all installments are paid
    const allPaid = this.schedule.every((item) => item.status === 'Paid');

    if (allPaid) {
      this.updateLoanStatus(this.selectedLoanId!, 'Paid');
    }

    this.closePaymentModal(); // Close the modal after payment
  }

  isLoanFullyPaid(loanId: number): boolean {
    const loanSchedule = this.service.getLoanSchedule(loanId);
    return loanSchedule.every(
      (installment: any) => installment.status === 'Paid'
    );
  }

  updateLoanSchedule(paymentData: any): void {
    const loanSchedule = this.service.getLoanSchedule(paymentData.loanId);
    const installmentIndex = loanSchedule.findIndex(
      (inst: any) => inst.installmentNumber === paymentData.installmentNumber
    );

    if (installmentIndex !== -1) {
      loanSchedule[installmentIndex].status = 'Paid';
      this.service.updateLoanSchedule(paymentData.loanId, loanSchedule);
    }
    // Check if all installments are paid
    if (this.isLoanFullyPaid(paymentData.loanId)) {
      this.updateLoanStatus(paymentData.loanId, 'Paid');
    }
  }

  updateLoanStatus(loanId: number, status: string): void {
    const loans = this.service.getLoans();
    const loanIndex = loans.findIndex((loan) => loan.id === loanId);

    if (loanIndex !== -1) {
      loans[loanIndex].status = status;
      this.service.updateLoans(loans);
    }

    this.loadLoans();
    this.cdr.detectChanges(); // Force UI update
  }

  getCustomerName(customerId: number): string {
    const customer = this.customers.find((c) => c.id === customerId);
    return customer ? customer.fullName : 'Unknown';
  }

  closeModal(): void {
    this.selectedLoanId = null;
  }
}
