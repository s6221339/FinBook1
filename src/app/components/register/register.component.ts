import { CommonModule } from '@angular/common';
import { ApiService } from './../../@services/api.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  standalone: true
})
export class RegisterComponent {

   constructor(
    private router: Router,
    private apiService: ApiService
  ) { }

  name: string = '';
  account: string = '';
  password: string = '';
  confirmPassword: string = '';
  verificationCode: string = '';
  showPassword: boolean = false;
  showConfirm: boolean = false;

  countdown: number = 0;
  countdownTimer: ReturnType<typeof setInterval> | null = null;
  isSending: boolean = false;
  verified: boolean = false;

  //  密碼強度文字
  get passwordStrength(): string {
    if(this.password.length < 8 || this.password.length > 16) return '不符長度';
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{10,16}$/;
    const medium = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/;

    if(strong.test(this.password)) return '強';
    if(medium.test(this.password)) return '中';
    return '弱';
  }

  //  密碼強度樣式對應 class
  get strengthClass(): string {
    const level = this.passwordStrength;
    if(level == '強') return 'strength-strong';
    if(level == '中') return 'strength-medium';
    return 'strength-weak';
  }

  //  切換眼睛圖示
  toggleVisibility(field: 'password' | 'confirm') {
    if(field == 'password') this.showPassword = !this.showPassword;
    else this.showConfirm = !this.showConfirm;
  }

  sendVerificationCode() {
    if(!this.account.trim()) {
      Swal.fire('錯誤', '請輸入信箱', 'warning');
      return;
    }

    this.isSending = true;
    this.apiService.sendRegistrationVerificationCode(this.account)
      .then(() => {
        Swal.fire('✅ 成功', '驗證碼已寄出', 'success');
        this.countdown = 60;
        this.countdownTimer = setInterval(() => {
          this.countdown--;
          if(this.countdown <= 0 && this.countdownTimer !== null) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
            this.isSending = false;
          }
        }, 1000);
      })
      .catch(err => {
        console.error(err);
        Swal.fire('錯誤', err.response?.data?.message || '寄送失敗', 'error');
        this.isSending = false;
      });
  }

  async register() {
    if(!this.name || !this.account || !this.password || !this.confirmPassword || !this.verificationCode) {
      Swal.fire('錯誤', '請確認所有欄位皆有填寫', 'warning');
      return;
    }

    if(this.password !== this.confirmPassword) {
      Swal.fire('錯誤', '密碼與確認密碼不一致', 'error');
      return;
    }

    const passwordValid = /^[A-Za-z0-9]{8,16}$/.test(this.password);
    if(!passwordValid) {
      Swal.fire('錯誤', '密碼須為 8~16 位英數字，且不可有空白或特殊字元', 'error');
      return;
    }

    try {
      await this.apiService.verifyRegistrationVerificationCode(this.verificationCode, this.account);
    }
    catch (err: any) {
      Swal.fire('錯誤', err.response?.data?.message || '驗證碼錯誤', 'error');
      return;
    }

    this.apiService.register({
      name: this.name,
      account: this.account,
      password: this.password,
      phone: ''
    })
    .then(() => {
      Swal.fire('🎉 註冊成功', '請登入使用', 'success').then(() => {
        this.router.navigate(['/login']);
      });
    })
    .catch(err => {
      Swal.fire('錯誤', err.response?.data?.message || '註冊失敗', 'error');
    });
  }

  CancelClick() {
    this.router.navigate(['/login']);
  }

}
