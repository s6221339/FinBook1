import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from "@angular/common"
import { MatIconModule } from "@angular/material/icon"

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.scss'
})
export class UnauthorizedComponent {

  constructor(
    private router: Router,
    private location: Location,
  ){}

  goHome(){
    this.router.navigate(['/home']);
  }
  goBack() {
    this.location.back()
  }
}
