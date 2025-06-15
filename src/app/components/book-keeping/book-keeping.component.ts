import { PaymentService } from './../../@services/payment.service';
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
    private router: Router,
    private paymentService: PaymentService
  ){}

  goFixedIncome(){
    this.paymentService.cleanFormData();
    this.router.navigate(['/bookKeeping/fixedIncome']);
  }

  goFixedExpenses(){
    this.paymentService.cleanFormData();
    this.router.navigate(['/bookKeeping/fixedExpenses']);
  }

  goIncome(){
    this.paymentService.cleanFormData();
    this.router.navigate(['/bookKeeping/income']);
  }

  goExpenses(){
    this.paymentService.cleanFormData();
    this.router.navigate(['/bookKeeping/expenses']);
  }

  goTransfers(){
    this.paymentService.cleanFormData();
    this.router.navigate(['/bookKeeping/transfers']);
  }

  // 檢查當前路由是否匹配
  isCurrentRoute(route: string): boolean {
    return this.router.url == route || (route == "/bookKeeping/expenses" && this.router.url == "/bookKeeping")
  }
}
