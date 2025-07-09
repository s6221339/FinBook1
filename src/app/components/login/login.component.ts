import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../@services/auth.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon"
import { CommonModule } from "@angular/common"

@Component({
  selector: 'app-login',
  imports: [RouterLink, RouterLinkActive, FormsModule, MatIconModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',

})

export class LoginComponent {

  constructor(
    private router: Router,
    private authService: AuthService
  ){}

  account: string = '';
  password: string = '';
  showPassword: boolean = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  RegisterClick() {
    console.log('註冊按鈕被點擊了！');
    this.router.navigate(['/register']); // 使用 router.navigate() 導航
  }

  LoginClick(): void {
    this.authService.login(this.account, this.password).subscribe(success => {
      if(success) {
        this.router.navigate(['/home']);
      }
      else{
        Swal.fire({
          icon: 'error',
          title: '登入失敗',
          text: '請確認帳號密碼',
          confirmButtonText: '確定'
        });
      }
    });
  }

}
