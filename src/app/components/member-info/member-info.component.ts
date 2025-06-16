import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MemberdataService, MemberData } from '../../@services/memberdata.service';

@Component({
  selector: 'app-member-info',
  imports: [FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './member-info.component.html',
  styleUrl: './member-info.component.scss'
})
export class MemberInfoComponent {
  memberInfoForm!: FormGroup;

  years: number[] = [];
  months: number[] = [];
  days: number[] = [];

  selectedYear: number | null = null;
  selectedMonth: number | null = null;
  selectedDay: number | null = null;

  constructor(private router: Router, private fb: FormBuilder, private memberdataService: MemberdataService) {}

  ngOnInit(): void {
    this.memberInfoForm = this.fb.group({
      name: ['我很帥', Validators.required],
      phoneNumber: [
        '0912345678',
        [
          Validators.required,
          Validators.pattern(/^09\d{8}$/)
        ]
      ]
    });

    this.generateYears();
    this.generateMonths();

    const today = new Date();
    this.selectedYear = today.getFullYear();
    this.selectedMonth = today.getMonth() + 1;
    this.selectedDay = 1;

    this.onDateChange();
  }

  generateYears(): void {
    const currentYear = new Date().getFullYear();
    for (let i = 1900; i <= currentYear; i++) {
      this.years.push(i);
    }
  }

  generateMonths(): void {
    for (let i = 1; i <= 12; i++) {
      this.months.push(i);
    }
  }

  onDateChange(): void {
    const year = this.selectedYear;
    const month = this.selectedMonth;

    if (year !== null && month !== null) {
      const daysInMonth = new Date(year, month, 0).getDate();
      this.days = [];
      for (let i = 1; i <= daysInMonth; i++) {
        this.days.push(i);
      }
      if (this.selectedDay !== null && this.selectedDay > daysInMonth) {
        this.selectedDay = daysInMonth;
      }
    } else {
      this.days = [];
      for (let i = 1; i <= 31; i++) {
        this.days.push(i);
      }
    }
  }

  onSaveClick(): void {
    if (this.memberInfoForm.valid) {
      const memberData: MemberData = {
        name: this.memberInfoForm.get('name')?.value,
        dobYear: this.selectedYear,
        dobMonth: this.selectedMonth,
        dobDay: this.selectedDay,
        phoneNumber: this.memberInfoForm.get('phoneNumber')?.value
      };

      this.memberdataService.updateMemberData(memberData);

      console.log('表單有效，資料已傳遞至服務。');
      console.log('傳遞的資料:', memberData);

      this.router.navigate(['/memberCenter/memberConfirm']);
    } else {
      console.log('表單無效，請檢查輸入。');
      this.memberInfoForm.markAllAsTouched();
    }
  }
}
