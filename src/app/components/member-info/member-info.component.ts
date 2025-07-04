import { AuthService } from './../../@services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserVO } from '../../models/userVO';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-member-info',
  imports: [FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './member-info.component.html',
  styleUrl: './member-info.component.scss'
})
export class MemberInfoComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ){}

  memberInfoForm!: FormGroup;
  //  生日下拉式選單資料
  years: number[] = [];
  months: number[] = Array.from({ length: 12 }, (_, i) => i + 1);
  days: number[] = [];
  //  下拉式選單值
  selectedYear: number | null = null;
  selectedMonth: number | null = null;
  selectedDay: number | null = null;
  //  當前使用者
  currentUser: UserVO | null = null;

  ngOnInit(): void {
    this.initForm();
    this.generateYears();

    const user = this.authService.getCurrentUser();
    if(user) {
      this.currentUser = user;
      this.fillForm(user);
    }
  }

  initForm(): void {
    this.memberInfoForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', Validators.pattern(/^09\d{8}$/)],
    });
  }

  generateYears(): void {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 100}, (_, i) => currentYear - i);
  }

  fillForm(user: UserVO): void {
    this.memberInfoForm.patchValue({
      name: user.name,
      phoneNumber: user.phone,
    });

    //  解析生日 yyyy-MM-dd
    const [year, month, day] = user.birthday.split('-').map(Number);
    this.selectedYear = year;
    this.selectedMonth = month;
    this.selectedDay = day;
    this.updateDaysInMonth();
  }

  updateDaysInMonth(): void {
    if(this.selectedYear && this.selectedMonth) {
      const lastDay = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
      this.days = Array.from({ length: lastDay }, (_, i) => i + 1);

      //  確保 selectedDay 合法
      if(!this.days.includes(this.selectedDay!)) {
        this.selectedDay = null;
      }
    }
  }

  onSubmit(): void {
    if(this.memberInfoForm.invalid) {
      Swal.fire('錯誤', '請完整填寫所有欄位', 'error');
      return;
    }

    const updatedUser: UserVO = {
      account: this.currentUser!.account,
      name: this.memberInfoForm.value.name,
      phone: this.memberInfoForm.value.phoneNumber,
      birthday: `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(this.selectedDay).padStart(2, '0')}`,
      avatar: this.currentUser!.avatar,
      role: this.currentUser!.role
    };

    this.authService.updateMemberInfo(updatedUser)
      .then(success => {
        if(success) {
          Swal.fire('✅ 更新成功', '您的資料已成功更新', 'success');
          this.router.navigate(['/memberCenter']);
        }
        else {
          Swal.fire('❌ 更新失敗', '請稍後再試', 'error');
        }
      })
      .catch(err => {
        console.error('會員資料更新時發生錯誤', err);
        Swal.fire('❌ 更新失敗', err.message || '請稍後再試', 'error');
      });
  }

}
