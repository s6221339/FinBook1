import { ApiService } from './../../@services/api.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { MatIconModule } from "@angular/material/icon"
import { CommonModule } from "@angular/common"

@Component({
  selector: 'app-forget-passwords',
  imports: [FormsModule, MatIconModule, CommonModule, RouterLink],
  templateUrl: './forget-passwords.component.html',
  styleUrl: './forget-passwords.component.scss',
  standalone: true,
})
export class ForgetPasswordsComponent {

  constructor(
    private apiService: ApiService,
    private router: Router
  ){}

  account: string = '';
  verifyCode: string = '';
  codeSent: boolean = false;
  countdown: number = 0;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  isSendingCode = false;

  sendCode() {
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

    //  防連點
    if(this.isSendingCode) return;
    this.isSendingCode = true;

    this.apiService.sendVerificationCode(this.account)
      .then(res => {
        this.isSendingCode = false;

        if(res.data.code == 200) {
          this.codeSent = true;
          Swal.fire({
            icon: 'success',
            title: '驗證碼已寄出',
            text: '請檢查您的信箱並輸入收到的驗證碼',
            confirmButtonText: '確定'
          });
          this.startCountdown();
        }
        else{
          Swal.fire({
            icon: 'error',
            title: '發送失敗',
            text: res.data.message || '無法寄送驗證碼，請稍後再試',
            confirmButtonText: '確定'
          });
        }
      })
      .catch(err => {
        this.isSendingCode = false;
        Swal.fire({
          icon: 'error',
          title: '發送失敗',
          text: '伺服器錯誤或帳號不存在，請稍後再試',
          confirmButtonText: '確定'
        });
        console.error(err);
      });
  }

  checkCode() {
    // 前端驗證
    if (!this.verifyCode.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '請輸入驗證碼',
        text: '請在驗證碼欄位輸入收到的驗證碼',
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

    this.apiService.checkVerificationCode(this.verifyCode, this.account)
      .then(res => {
        if(res.data.code == 200) {
          Swal.fire({
            icon: 'success',
            title: '驗證成功',
            text: '請重新設定新密碼',
            confirmButtonText: '確定'
          }).then(() => {
            this.router.navigate(['/resetPassword'], { queryParams: { account: this.account } });
          });
        }
        else{
          Swal.fire({
            icon: 'error',
            title: '驗證碼錯誤',
            text: res.data.message || '請確認驗證碼是否正確',
            confirmButtonText: '確定'
          });
        }
      })
      .catch(err => {
        Swal.fire({
          icon: 'error',
          title: '驗證失敗',
          text: '伺服器錯誤，請稍後再試',
          confirmButtonText: '確定'
        });
        console.error(err);
      });
  }

  startCountdown() {
    this.countdown = 60;

    //  先清除舊的 interval （防止多重倒數）
    if(this.countdownInterval !== null) {
      clearInterval(this.countdownInterval);
    }

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if(this.countdown <= 0 && this.countdownInterval !== null) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
    }, 1000);
  }

}
