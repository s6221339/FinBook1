import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-payment',
  imports: [],
  templateUrl: './edit-payment.component.html',
  styleUrl: './edit-payment.component.scss'
})
export class EditPaymentComponent implements OnInit{

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ){}

  paymentId!: number;

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('paymentId');
    if(id){
      this.paymentId = +id;
      //  根據 paymentId 撈資料進行編輯
    }
    else{
      alert('未傳入要編輯的 paymentId');
      this.router.navigate(['/modifyPayment']);
    }
  }

}
