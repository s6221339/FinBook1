import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { Subscription } from 'rxjs'; // 導入 Subscription

export enum MemberCenterView {
  Info = 'info',
  Confirm = 'confirm'
}


@Component({
  selector: 'app-member-center',
  imports: [RouterOutlet,RouterLink,RouterLinkActive],
  templateUrl: './member-center.component.html',
  styleUrl: './member-center.component.scss'
})
export class MemberCenterComponent {


  // 注入 MemberDataService
  constructor(private router: Router) { }

  ngOnInit(): void {



}
}
