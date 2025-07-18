import { AuthService } from './../../@services/auth.service';
import { Component, OnInit } from '@angular/core';
import { MemberdataService } from '../../@services/memberdata.service';
import { Router } from '@angular/router';
import { UserVO } from '../../models/userVO';
import Swal from 'sweetalert2';
import { ApiService } from '../../@services/api.service';
import { MatIconModule } from "@angular/material/icon"
import { CommonModule } from "@angular/common"

@Component({
  selector: 'app-member-confirm',
  imports: [MatIconModule, CommonModule],
  standalone:true,
  templateUrl: './member-confirm.component.html',
  styleUrl: './member-confirm.component.scss'
})
export class MemberConfirmComponent implements OnInit{

  constructor(
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService
  ) { }

  userData?: UserVO;  //  用來存放目前登入的會員資料
  birthdayYear?: string;
  birthdayMonth?: string;
  birthdayDay?: string;
  selectedFile?: File;
  previewUrl: string | null = null;

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if(!user) {
      //  若未登入則導向登入頁
      this.router.navigate(['/login']);
      return;
    }

    this.userData = user;

    //  將生日格式 yyyy-MM-dd 拆解
    if(user.birthday) {
      const [year, month, day] = user.birthday.split('-');
      this.birthdayYear = year;
      this.birthdayMonth = month;
      this.birthdayDay = day;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if(input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      //  預覽圖
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
        this.uploadAvatar(this.previewUrl!);
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  //  讓 uploadAvatar 接收 base64 圖片字串
  uploadAvatar(base64Image: string): void {
    if(!this.userData) return;

    const updatedUser: UserVO = {
      ...this.userData,
      avatar: base64Image
    };

    console.log('🧾 updatedUser', updatedUser);

    this.authService.updateMemberInfo(updatedUser)
      .then(success => {
        if(success) {
          this.userData = updatedUser;
          this.previewUrl = null; //  清除暫存
          this.selectedFile = undefined;
          //  同步 localStorage
          this.authService.updateLocalUser(updatedUser);
          Swal.fire('✅ 成功', '大頭貼已更新', 'success');
        }
        else{
          Swal.fire('❌ 失敗', '更新失敗，請稍後再試', 'error');
        }
      })
      .catch(err => {
        console.error('更新失敗', err);
        Swal.fire('❌ 錯誤', '請檢察網路連線或聯絡管理員', 'error');
      });
  }

  confirmDeleteAccount(): void {
    const user = this.authService.getCurrentUser();
    if(!user) return;

    //  生成六位數亂碼
    const verificationCode = this.generateRandomCode(6);

    Swal.fire({
      title: '⚠️ 註銷帳號確認',
      html: `此操作無法復原。<br><br>請輸入下列驗證碼：<br><strong>${verificationCode}</strong>`,
      input: 'text',
      inputLabel: '請輸入上方驗證碼以繼續',
      inputPlaceholder: '輸入驗證碼',
      showCancelButton: true,
      confirmButtonText: '下一步',
      cancelButtonText: '取消',
      preConfirm: (input) => {
        if(!input || input !== verificationCode) {
          Swal.showValidationMessage('驗證碼錯誤，請重新輸入');
          return false;
        }
        return true;
      }
    }).then(result => {
      if(result.isConfirmed) {
        //  再次確認
        Swal.fire({
          title: '⚠️ 最終確認',
          text: '確定要永久刪除帳號嗎？此操作無法復原！',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: '是的，我要刪除',
          cancelButtonText: '取消'
        }).then(finalResult => {
          if(finalResult.isConfirmed) {
            this.apiService.deleteAccount(user.account)
              .then(() => {
                //  執行登出
                this.authService.logout().subscribe(() => {
                  Swal.fire('✅ 已註銷', '您的帳號已成功刪除', 'success');
                  this.router.navigate(['/login']);
                });
              })
              .catch(err => {
                console.error('註銷帳號失敗', err);
                Swal.fire('❌ 錯誤', '無法刪除帳號，請稍後再試', 'error');
              });
          }
        });
      }
    });
  }

  private generateRandomCode(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for(let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  goToEdit(){
    this.router.navigate(['/memberCenter/memberInfo']);
  }

}
