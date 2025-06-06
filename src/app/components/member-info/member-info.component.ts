import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-member-info',
  imports: [],
  templateUrl: './member-info.component.html',
  styleUrl: './member-info.component.scss'
})
export class MemberInfoComponent {
   constructor(private router: Router) { }
}
