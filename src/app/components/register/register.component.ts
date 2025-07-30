import { CommonModule } from '@angular/common';
import { ApiService } from './../../@services/api.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatIconModule } from "@angular/material/icon"

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule, MatIconModule],
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
    // 前端驗證
    if (!this.account.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '請輸入信箱',
        text: '請在信箱欄位輸入您的電子郵件地址',
        confirmButtonText: '確定'
      });
      return;
    }

    // 驗證信箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.account)) {
      Swal.fire({
        icon: 'warning',
        title: '信箱格式錯誤',
        text: '請輸入正確的電子郵件地址格式',
        confirmButtonText: '確定'
      });
      return;
    }

    this.isSending = true;
    this.apiService.sendRegistrationVerificationCode(this.account)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: '驗證碼已寄出',
          text: '請檢查您的信箱並輸入收到的驗證碼',
          confirmButtonText: '確定'
        });
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
        Swal.fire({
          icon: 'error',
          title: '寄送失敗',
          text: err.response?.data?.message || '無法寄送驗證碼，請稍後再試',
          confirmButtonText: '確定'
        });
        this.isSending = false;
      });
  }

  async register() {
    // 前端驗證 - 檢查必填欄位
    if (!this.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '請輸入姓名',
        text: '請在姓名欄位輸入您的姓名',
        confirmButtonText: '確定'
      });
      return;
    }

    if (!this.account.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '請輸入信箱',
        text: '請在信箱欄位輸入您的電子郵件地址',
        confirmButtonText: '確定'
      });
      return;
    }

    if (!this.password.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '請輸入密碼',
        text: '請在密碼欄位輸入您的密碼',
        confirmButtonText: '確定'
      });
      return;
    }

    if (!this.confirmPassword.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '請確認密碼',
        text: '請在確認密碼欄位再次輸入您的密碼',
        confirmButtonText: '確定'
      });
      return;
    }

    if (!this.verificationCode.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '請輸入驗證碼',
        text: '請在驗證碼欄位輸入收到的驗證碼',
        confirmButtonText: '確定'
      });
      return;
    }

    // 驗證信箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.account)) {
      Swal.fire({
        icon: 'warning',
        title: '信箱格式錯誤',
        text: '請輸入正確的電子郵件地址格式',
        confirmButtonText: '確定'
      });
      return;
    }

    // 驗證密碼一致性
    if (this.password !== this.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: '密碼不一致',
        text: '兩次輸入的密碼不一致，請重新輸入',
        confirmButtonText: '確定'
      });
      return;
    }

    // 驗證密碼格式
    const passwordValid = /^[A-Za-z0-9]{8,16}$/.test(this.password);
    if (!passwordValid) {
      Swal.fire({
        icon: 'error',
        title: '密碼格式錯誤',
        text: '密碼須為 8~16 位英數字，且不可有空白或特殊字元',
        confirmButtonText: '確定'
      });
      return;
    }

    try {
      await this.apiService.verifyRegistrationVerificationCode(this.verificationCode, this.account);
    }
    catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: '驗證碼錯誤',
        text: err.response?.data?.message || '請確認驗證碼是否正確',
        confirmButtonText: '確定'
      });
      return;
    }

    this.apiService.register({
      name: this.name,
      account: this.account,
      password: this.password,
      phone: ''
    })
    .then(() => {
      Swal.fire({
        icon: 'success',
        title: '🎉 註冊成功',
        text: '您的帳戶已成功建立，請登入使用',
        confirmButtonText: '確定'
      }).then(() => {
        this.router.navigate(['/login']);
      });
    })
    .catch(err => {
      Swal.fire({
        icon: 'error',
        title: '註冊失敗',
        text: err.response?.data?.message || '註冊過程中發生錯誤，請稍後再試',
        confirmButtonText: '確定'
      });
    });
  }

  CancelClick() {
    this.router.navigate(['/login']);
  }

}
