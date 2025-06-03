import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-book-keeping',
  imports: [RouterOutlet],
  templateUrl: './book-keeping.component.html',
  styleUrl: './book-keeping.component.scss'
})
export class BookKeepingComponent {

  constructor(
    private router: Router
  ){}

  goFixedIncome(){
    this.router.navigate(['/bookKeeping/fixedIncome']);
  }

  goFixedExpenses(){
    this.router.navigate(['/bookKeeping/fixedExpenses']);
  }

  goIncome(){
    this.router.navigate(['/bookKeeping/income']);
  }

  goExpenses(){
    this.router.navigate(['/bookKeeping/expenses']);
  }

  goTransfers(){
    this.router.navigate(['/bookKeeping/transfers']);
  }

}
