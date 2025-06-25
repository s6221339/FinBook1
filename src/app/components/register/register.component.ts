import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../@services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [CommonModule,FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  formData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: ''
  };

   constructor(private router: Router , private apiService: ApiService) { }

  async confirmClick(): Promise<void> {
    // 檢查密碼一致性
    if (this.formData.password !== this.formData.confirmPassword) {
      alert('密碼與確認密碼不一致');
      return;
    }

    try {
      const res = await this.apiService.createBalance({
        name: this.formData.name,
        account: this.formData.email, // 假設信箱作為帳號
        initAmount: 0
      });
      console.log('帳戶創建成功：', res.data);
      alert('註冊成功！');
      this.router.navigate(['/login']);
    } catch (err) {
      console.error('創建失敗：', err);
      alert('註冊失敗，請稍後再試');
    }
  }

  CancelClick() {
    console.log('取消按鈕被點擊了！');
    this.router.navigate(['/login']); // 使用 router.navigate() 導航
  }

  sendVerification(): void {
    console.log('寄出驗證信給', this.formData.email);
    // 實際串接寄信 API 的話，這裡呼叫對應方法
  }
}
