import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

   constructor(private router: Router) { }

  CancelClick() {
    console.log('取消按鈕被點擊了！');
    this.router.navigate(['/login']); // 使用 router.navigate() 導航
  }

}
