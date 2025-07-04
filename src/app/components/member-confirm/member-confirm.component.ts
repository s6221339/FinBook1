import { AuthService } from './../../@services/auth.service';
import { Component, OnInit } from '@angular/core';
import { MemberdataService } from '../../@services/memberdata.service';
import { Router } from '@angular/router';
import { UserVO } from '../../models/userVO';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-member-confirm',
  imports: [],
  standalone:true,
  templateUrl: './member-confirm.component.html',
  styleUrl: './member-confirm.component.scss'
})
export class MemberConfirmComponent implements OnInit{

  constructor(
    private memberdataService: MemberdataService,
    private router: Router,
    private authService: AuthService
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

  goToEdit(){
    this.router.navigate(['/memberCenter/memberInfo']);
  }

}
