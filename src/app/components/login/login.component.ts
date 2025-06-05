import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  RegisterClick() {
    console.log('註冊按鈕被點擊了！');
  }

  LoginClick(): void {
    console.log('登入按鈕被點擊了！');
  }
}
