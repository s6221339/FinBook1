import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',

})

export class LoginComponent {

  constructor(private router: Router) { }

  RegisterClick() {
    console.log('註冊按鈕被點擊了！');
    this.router.navigate(['/register']); // 使用 router.navigate() 導航
  }

  LoginClick(): void {
    console.log('登入按鈕被點擊了！');
    this.router.navigate(['/memberCenter']); // 使用 router.navigate() 導航
  }
}
