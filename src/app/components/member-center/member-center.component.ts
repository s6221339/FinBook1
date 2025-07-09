import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterLink} from '@angular/router';
import { filter } from 'rxjs';
import { MatIconModule } from "@angular/material/icon"
import { CommonModule } from "@angular/common"
import { AuthService } from "../../@services/auth.service"
import { UserVO } from "../../models/userVO"

@Component({
  selector: 'app-member-center',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatIconModule, CommonModule],
  templateUrl: './member-center.component.html',
  styleUrl: './member-center.component.scss'
})
export class MemberCenterComponent {
  currentUrl: string = '';
  currentUser: UserVO | null = null

  constructor(private router: Router,private authService: AuthService) {}

    ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser()
    this.currentUrl = this.router.url;
    console.log('目前網址（初始化）：', this.currentUrl);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.urlAfterRedirects;
      console.log('目前網址（路由更新）：', this.currentUrl);
    });


    }


}
