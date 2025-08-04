import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterLink} from '@angular/router';
import { filter } from 'rxjs';
import { MatIconModule } from "@angular/material/icon"
import { CommonModule } from "@angular/common"
import { AuthService } from "../../@services/auth.service"
import { UserVO } from "../../models/userVO"
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-member-center',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatIconModule, CommonModule, MatTooltipModule],
  templateUrl: './member-center.component.html',
  styleUrl: './member-center.component.scss'
})
export class MemberCenterComponent implements OnInit,OnDestroy{

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  currentUrl: string = '';
  currentUser: UserVO | null = null;
  isSidebarCollapsed: boolean = false;
  private userSub?: Subscription;

  ngOnInit(): void {
    this.currentUrl = this.router.url;

    //  透過訂閱方式取得即時會員資料
    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      this.currentUrl = event.urlAfterRedirects;
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

}
