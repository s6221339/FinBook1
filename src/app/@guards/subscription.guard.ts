import { AuthService } from './../@services/auth.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

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
