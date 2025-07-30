import { AuthService } from './../@services/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

//  將守衛註冊為可注入服務
@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ){}

  /**
   * canActivate 是路由守衛的核心方法
   * 當使用者導航至套用此 Guard 的路由時會觸發
   * 確認是否登入
   * @returns  boolean - 是否允許進路該路由
   */
  canActivate(): boolean {
    if(this.authService.isLoggedIn()) {
      return true;
    }
    else{
      this.router.navigate(['/login']);
      return false;
    }
  }

}
