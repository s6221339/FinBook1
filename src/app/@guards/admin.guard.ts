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
