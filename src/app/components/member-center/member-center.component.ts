import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-member-center',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './member-center.component.html',
  styleUrl: './member-center.component.scss'
})
export class MemberCenterComponent {
  currentUrl: string = '';

  constructor(private router: Router) {}
    // 直接在 constructor 裡初始化
    ngOnInit(): void {
      console.log(1111111);
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
