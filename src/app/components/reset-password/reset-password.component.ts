import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { ApiService } from '../../@services/api.service';
import { MatIconModule } from "@angular/material/icon"

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, MatIconModule,RouterModule],
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
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{10,16}$/;
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
    // 前端驗證 - 檢查必填欄位
    if (!this.newPassword.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '請輸入新密碼',
        text: '請在新密碼欄位輸入您的新密碼',
        confirmButtonText: '確定'
      });
      return;
    }

    if (!this.confirmPassword.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '請確認新密碼',
        text: '請在確認新密碼欄位再次輸入您的新密碼',
        confirmButtonText: '確定'
      });
      return;
    }

    // 驗證密碼格式
    if (/\s/.test(this.newPassword)) {
      Swal.fire({
        icon: 'warning',
        title: '密碼格式錯誤',
        text: '密碼不得包含空白字元',
        confirmButtonText: '確定'
      });
      return;
    }

    if (/[^a-zA-Z0-9]/.test(this.newPassword)) {
      Swal.fire({
        icon: 'warning',
        title: '密碼格式錯誤',
        text: '密碼不得包含特殊符號',
        confirmButtonText: '確定'
      });
      return;
    }

    if (this.newPassword.length < 8 || this.newPassword.length > 16) {
      Swal.fire({
        icon: 'warning',
        title: '密碼長度錯誤',
        text: '密碼長度須為 8～16 字元',
        confirmButtonText: '確定'
      });
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: '密碼不一致',
        text: '兩次輸入的密碼不一致，請重新輸入',
        confirmButtonText: '確定'
      });
      return;
    }

    const payload = {
      account: this.account,
      newPassword: this.newPassword
    };

    this.apiService.updatePasswordByEmail(payload)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: '密碼重設成功',
          text: '您的密碼已成功重設，請重新登入',
          confirmButtonText: '確定'
        }).then(() => this.router.navigate(['/login']));
      })
      .catch(err => {
        console.error('密碼重設失敗', err);
        Swal.fire({
          icon: 'error',
          title: '❌ 密碼重設失敗',
          text: err?.response?.data?.message || '密碼更新失敗，請稍後再試',
          confirmButtonText: '確定'
        });
      })
  }

}
