import { AuthService } from './../@services/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
  * canActivate 是路由守衛的核心方法
  * 當使用者導航至套用此 Guard 的路由時會觸發
  * 確認是否訂閱
  * @returns  boolean - 是否允許進路該路由
  */
  canActivate(): boolean {
    const user = this.authService.getCurrentUser();

    if(user && user.subscription == 'subscribed') {
      return true;  //  已訂閱可通行
    }
    else{
      //  未訂閱則導回訂閱頁面
      this.router.navigate(['/memberCenter/publishSubscription']);
      return false;
    }
  }

}
