import { AuthService } from './../../@services/auth.service';
import { ApiService } from './../../@services/api.service';
import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon"

@Component({
  selector: 'app-change-passwords',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './change-passwords.component.html',
  styleUrl: './change-passwords.component.scss',
  standalone: true
})
export class ChangePasswordsComponent {

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ){}

  currentPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  isSaving: boolean = false;

  showCurrent: boolean = false;
  showNew: boolean = false;
  showConfirm: boolean = false;

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

  toggleVisibility(field: 'current' | 'new' | 'confirm') {
    if(field == 'current') this.showCurrent = !this.showCurrent;
    else if(field == 'new') this.showNew = !this.showNew;
    else this.showConfirm = !this.showConfirm;
  }

  savePassword(): void {
    //  防止重複點擊
    if(this.isSaving) return;
    this.isSaving = true;

    const user = this.authService.getCurrentUser();
    if(!user) {
      Swal.fire('錯誤', '尚未登入，請重新登入', 'error');
      this.router.navigate(['/login']);
      this.isSaving = false;
      return;
    }

    if(!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
      Swal.fire('錯誤', '請完整填寫所有欄位', 'error');
      this.isSaving = false;
      return;
    }

    if(this.newPassword.length < 8 || this.newPassword.length > 16) {
      Swal.fire('格式錯誤', '新密碼長度須介於 8 到 16 碼之間', 'warning');
      this.isSaving = false;
      return;
    }

    if(/\s/.test(this.newPassword)) {
      Swal.fire('格式錯誤', '新密碼不得包含空白字元', 'warning');
      this.isSaving = false;
    return;
    }

    if(this.newPassword !== this.confirmNewPassword) {
      Swal.fire('錯誤', '新密碼與確認密碼不一致', 'error');
      this.isSaving = false;
      return;
    }
    if(!/^[a-zA-Z0-9]+$/.test(this.newPassword)) {
      Swal.fire('格式錯誤', '新密碼僅可包含英文字母與數字，不能有特殊符號', 'warning');
      this.isSaving = false;
      return;
    }

    const data = {
      account: user.account,
      oldPassword: this.currentPassword,
      newPassword: this.newPassword
    };

    this.apiService.updateUserPassword(data)
      .then(res => {
        if(res.data.code == 200) {
          Swal.fire('成功', '密碼已更新', 'success')
            .then(() => {
              this.authService.logout().subscribe(() => {
                this.router.navigate(['/login']);
              });
            });
        }
        else {
          Swal.fire('錯誤', res.data.message || '密碼更新失敗', 'error');
        }
      })
      .catch(err => {
        console.error('密碼更新失敗', err);
        Swal.fire('錯誤', '請稍後再試', 'error');
      })
      .finally(() => {
        this.isSaving = false;
      });
  }

  goBack(): void {
    this.router.navigate(["/memberCenter/memberConfirm"])
  }

}
