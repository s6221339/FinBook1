import { AuthService } from './../@services/auth.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class AntiAuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ){}

  canActivate(): boolean {
    if(this.authService.isLoggedIn()) {
      this.router.navigate(['/memberCenter']);
      return false;
    }
    else{
      return true;
    }
  }

}
