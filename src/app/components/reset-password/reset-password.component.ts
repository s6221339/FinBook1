import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ApiService } from '../../@services/api.service';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  standalone: true,
})
export class ResetPasswordComponent implements OnInit{

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ){}

  account: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  showNew: boolean = false;
  showConfirm: boolean = false;

  ngOnInit(): void {
    this.account = this.route.snapshot.queryParamMap.get('account') || '';
  }

  toggleVisibility(field: 'new' | 'confirm') {
    if(field == 'new') this.showNew = !this.showNew;
    else this.showConfirm = !this.showConfirm;
  }

  get passwordStrength(): string {
    if(this.newPassword.length < 8 || this.newPassword.length > 16) return '不符長度';
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/;
    const medium = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/;
    if(strong.test(this.newPassword)) return '強';
    if(medium.test(this.newPassword)) return '中';
    return '弱';
  }

  get strengthClass(): string {
    const level = this.passwordStrength;
    if(level == '強') return 'strength-strong';
    if(level == '中') return 'strength-medium';
    return 'strength-weak';
  }

  submit(): void {
    //  驗證格式
    if(!this.newPassword || !this.confirmPassword) {
      Swal.fire('⚠️ 欄位未填', '請輸入新密碼與確認密碼', 'warning');
      return;
    }

    if(/\s/.test(this.newPassword)) {
      Swal.fire('格式錯誤', '密碼不得包含空白字元', 'warning');
      return;
    }

    if(this.newPassword.length < 8 || this.newPassword.length > 16) {
      Swal.fire('❌ 密碼長度錯誤', '密碼長度須為 8～16 字元', 'warning');
      return;
    }
    if(this.newPassword !== this.confirmPassword) {
      Swal.fire('❌密碼不一致', '兩次輸入的密碼不一致', 'warning');
      return;
    }

    const payload = {
      account: this.account,
      newPassword: this.newPassword
    };

    this.apiService.updatePasswordByEmail(payload)
      .then(() => {
        Swal.fire('✅ 成功', '密碼已重設，請重新登入', 'success')
          .then(() => this.router.navigate(['/login']));
      })
      .catch(err => {
        console.error('密碼重設失敗', err);
        Swal.fire('❌失敗', err?.response?.data?.message || '密碼更新失敗請稍後再試', 'error');
      })
  }

}
