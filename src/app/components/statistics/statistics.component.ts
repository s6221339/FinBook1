import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-statistics',
  imports: [RouterModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent {

  constructor(
    private router: Router
  ){}

  goIncomeExpenseTrendChart(){
    this.router.navigate(['/statistics/incomeExpenseTrendChart']);
  }

  goExpenseByCategory(){
    this.router.navigate(['/statistics/expenseByCategory']);
  }

  goExpenseByAccount(){
    this.router.navigate(['/statistics/expenseByAccount']);
  }

  goIncomeByCategory(){
    this.router.navigate(['/statistics/incomeByCategory']);
  }

  goIncomeByAccount(){
    this.router.navigate(['/statistics/incomeByAccount']);
  }

}
