import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatIconModule } from "@angular/material/icon"
import { filter } from "rxjs/operators"

@Component({
  selector: 'app-statistics',
  imports: [RouterModule, MatIconModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent implements OnInit{

  currentRoute = ""

  constructor(
    private router: Router
  ){}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute.includes(route)
  }

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
