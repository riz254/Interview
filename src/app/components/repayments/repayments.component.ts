import { Component, Input } from '@angular/core';
import { ServicesService } from '../../services.service';

@Component({
  selector: 'app-repayments',
  templateUrl: './repayments.component.html',
  styleUrls: ['./repayments.component.css'],
})
export class RepaymentsComponent {
  @Input() loanId!: number;
  schedule: any[] = [];

  constructor(private service: ServicesService) {}

  ngOnInit(): void {
    this.loadSchedule();
  }

  loadSchedule(): void {
    this.schedule = this.service.getLoanSchedule(this.loanId);
  }

  markAsPaid(installmentNumber: number): void {
    const updatedSchedule = this.schedule.map((item) =>
      item.installmentNumber === installmentNumber
        ? { ...item, status: 'Paid' }
        : item
    );

    // Update LocalStorage
    const allSchedules = JSON.parse(
      localStorage.getItem('loanSchedules') || '{}'
    );
    allSchedules[this.loanId] = updatedSchedule;
    localStorage.setItem('loanSchedules', JSON.stringify(allSchedules));

    this.loadSchedule(); // Refresh the schedule
  }
}
