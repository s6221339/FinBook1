import { ApiService } from './../../@services/api.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forget-passwords',
  imports: [FormsModule],
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
    if(!this.account || this.account.trim() == '') {
      Swal.fire('錯誤', '請輸入帳號（信箱）', 'warning');
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
          Swal.fire('✅ 成功', '驗證碼已寄出，請查收您的信箱', 'success');
          this.startCountdown();
        }
        else{
          Swal.fire('錯誤', res.data.message || '發送失敗', 'error');
        }
      })
      .catch(err => {
        this.isSendingCode = false;
        Swal.fire('錯誤', '伺服器錯誤或帳號不存在', 'error');
        console.error(err);
      });
  }

  checkCode() {
    if(!this.verifyCode || !this.account) {
      Swal.fire('錯誤', '請輸入驗證碼', 'warning');
      return;
    }

    this.apiService.checkVerificationCode(this.verifyCode, this.account)
      .then(res => {
        if(res.data.code == 200) {
          Swal.fire('✅ 驗證成功', '請重新設定新密碼', 'success').then(() => {
            this.router.navigate(['/resetPassword'], { queryParams: { account: this.account } });
          });
        }
        else{
          Swal.fire('錯誤', res.data.message || '驗證碼錯誤', 'error');
        }
      })
      .catch(err => {
        Swal.fire('錯誤', '伺服器錯誤', 'error');
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
