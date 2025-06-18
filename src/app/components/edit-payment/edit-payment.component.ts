import { PaymentModifiedService } from './../../@services/payment-modified.service';
import { ApiService } from './../../@services/api.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentIdFormData } from '../../models/paymentIdFormData';
import { Category } from '../../models/categories';

@Component({
  selector: 'app-edit-payment',
  imports: [],
  templateUrl: './edit-payment.component.html',
  styleUrl: './edit-payment.component.scss',
  standalone: true
})
export class EditPaymentComponent implements OnInit{

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentModifiedService: PaymentModifiedService,
    private apiService: ApiService
  ){}

  paymentId!: number;
  account: string= 'a6221339';
  paymentData!: PaymentIdFormData;
  categories: Category[] = [];
  filteredItems: string[] = [];
  selectedType: string | null = null;
  selectedItem: string | null = null;
  description: string = '';
  amount: number | null = null;
  recurringYear: number | null = null;
  recurringMonth: number | null = null;
  recurringDay: number | null = null;
  recordDate: Date = new Date();

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

    const data = this.paymentModifiedService.getPaymentFormData();

    if(!data){
      alert('找不到要編輯的資料');
      this.router.navigate(['/modifyPayment']);
      return;
    }

    this.paymentData = data;

    //  預設值設定
    this.selectedType = data.type;
    this.selectedItem = data.item;
    this.description = data.description;
    this.amount = data.amount;
    this.recurringYear = data.recurringPeriodYear;
    this.recurringMonth = data.recurringPeriodMonth;
    this.recurringDay = data.recurringPeriodDay;
    this.recordDate = new Date(data.recordDate);

    //  取得所有分類資料供下拉式選單使用
    this.apiService.getTypeByAccount(this.account)
    .then(res => {
      this.categories = res.data.paymentTypeList || [];
      this.updateItemOptions();
    })
    .catch(err => {
      console.error('載入分類資料錯誤', err);
    });
  }

  updateItemOptions(): void {
    this.filteredItems = this.categories
      .filter(c => c.type == this.selectedType)
      .map(c => c.item);
  }

}
