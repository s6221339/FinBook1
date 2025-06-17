import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';



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



  constructor(private router: Router) { }

  ngOnInit(): void {



}
}
