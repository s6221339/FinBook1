import { AuthService } from './../@services/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate , Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class AdminGuard implements CanActivate{

  constructor(
    private authService: AuthService,
    private router: Router
  ){}

  /**
  * canActivate 是路由守衛的核心方法
  * 當使用者導航至套用此 Guard 的路由時會觸發
  * 確認是否為超級管理員
  * @returns  boolean - 是否允許進路該路由
  */
  canActivate(): boolean {
    if(this.authService.isLoggedIn() && this.authService.isAdmin()) {
      return true;
    }
    else{
      this.router.navigate(['/unauthorized']);
      return false;
    }
  }

}
