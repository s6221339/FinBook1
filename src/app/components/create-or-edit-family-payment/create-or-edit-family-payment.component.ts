import { AuthService } from './../../@services/auth.service';
import { ApiService } from './../../@services/api.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { PaymentInfos } from '../../models/PaymentInfos';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-create-or-edit-family-payment',
  imports: [FormsModule],
  templateUrl: './create-or-edit-family-payment.component.html',
  styleUrl: './create-or-edit-family-payment.component.scss',
  standalone: true,
  providers: [DatePipe]
})
export class CreateOrEditFamilyPaymentComponent implements OnInit{

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService,
    private dataPipe: DatePipe
  ) {}

  isEditMode: boolean = false;

  balanceId!: number; //  for create
  paymentId!: number; // for edit

  typeList: string[] = [];
  itemMap: { [type: string]: string[] } = {};

  selectedType: string = '';
  selectedItem: string = '';
  description: string = '';
  amount: number = 0;
  recordDate: string = '';

  ngOnInit(): void {
    this.initTypeItemList();

    const balanceId = this.route.snapshot.paramMap.get('balanceId');
    const paymentId = this.route.snapshot.paramMap.get('paymentId');

    if(paymentId) {
      this.isEditMode = true;
      this.paymentId = parseInt(paymentId, 10);
      this.loadPaymentInfo();
    }
    else if(balanceId) {
      this.isEditMode = false;
      this.balanceId = parseInt(balanceId, 10);
      const today = new Date();
      this.recordDate = this.dataPipe.transform(today, 'yyyy-MM-dd')!;
    }
  }

  initTypeItemList(): void {
    this.apiService.getTypeByAccount('')
      .then(res => {
        if(res.data.code == 200) {
          const list = res.data.paymentTypeList;
          list.forEach((entry: any) => {
            const type = entry.type;
            const item = entry.item;
            if(!this.itemMap[type]) {
              this.itemMap[type] = [];
              this.typeList.push(type);
            }
            this.itemMap[type].push(item);
          });
          // 初始化選中的類型
          if (this.typeList.length > 0) {
            this.selectedType = this.typeList[0];
          }
        }
      });
  }

  updateItemOptions(): void {
    // 當分類改變時，重置項目選擇
    if (this.selectedType && this.itemMap[this.selectedType]) {
      this.selectedItem = this.itemMap[this.selectedType][0] || '';
    }
  }

  goBack(): void {
    this.router.navigate(['/familyLedger']);
  }

  loadPaymentInfo(): void {
    const account = this.authService.getCurrentUser()?.account;
    if(!account) return;

    const payload = {
      account,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1
    };

    this.apiService.getMonthlyPaymentByFamiltBalance(payload)
      .then(res => {
        if(res.data.code == 200) {
          const list = res.data.balanceWithPaymentList.flatMap((b: any) => b.paymentInfoList);
          const found: PaymentInfos | undefined = list.find((p: PaymentInfos) => p.paymentId == this.paymentId);
          if(found) {
            this.selectedType = found.type;
            this.selectedItem = found.item;
            this.description = found.description;
            this.amount = found.amount;
            this.recordDate = found.recordDate;
          }
          else {
            Swal.fire('找不到資料', '指定的帳款不存在', 'error');
            this.router.navigate(['/familyLedger']);
          }
        }
      });
  }

  onSubmit(): void {
    if(!this.selectedType || !this.selectedItem || !this.amount) {
      Swal.fire('請填寫完整欄位', '', 'warning');
      return;
    }

    //  description 若無填寫給空字串
    const finalDescription = this.description?.trim() ?? '';

    //  驗證金額：必須是大於 0 的整數
    if(!Number.isInteger(this.amount) || this.amount <= 0) {
      Swal.fire('金額必須為大於 0 的整數', '', 'warning');
      return;
    }

    const data: any = {
      description: finalDescription,
      type: this.selectedType,
      item: this.selectedItem,
      amount: this.amount,
      recurringPeriod: { year: 0, month: 0, day: 0 },
      recordDate: this.recordDate
    };

    if(this.isEditMode) {
      console.log('送出資料:', data);
      data.paymentId = this.paymentId;
      this.apiService.updatePayment(data)
        .then(res => {
          console.log('API 回傳:', res.data);
          if(res.data.code == 200) {
            Swal.fire('修改成功！', '', 'success')
              .then(() => {
                this.router.navigate(['/familyLedger']);
              });
          }
        });
    }
    else {
      data.balanceId = this.balanceId;
      this.apiService.createPayment(data)
        .then(res => {
          if(res.data.code == 200) {
            Swal.fire('新增成功', '', 'success')
              .then(() => {
                this.router.navigate(['/familyLedger']);
              });
          }
        });
    }
  }

}
