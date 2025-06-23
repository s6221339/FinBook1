import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterLink} from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-member-center',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './member-center.component.html',
  styleUrl: './member-center.component.scss'
})
export class MemberCenterComponent {
  currentUrl: string = '';

  constructor(private router: Router) {}

    ngOnInit(): void {

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
