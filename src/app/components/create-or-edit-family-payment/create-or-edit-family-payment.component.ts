import { EditFamilyPaymentService } from './../../@services/edit-family-payment.service';
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
    private dataPipe: DatePipe,
    private editFamilyPaymentService: EditFamilyPaymentService
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

    this.initTypeItemList()
      .then(() => {
        if(paymentId) {
          this.isEditMode = true;
          this.paymentId = parseInt(paymentId, 10);

          const cached = this.editFamilyPaymentService.getPayment();
          if(cached && cached.paymentId == this.paymentId) {
            this.initTypeItemList(cached.type, cached.item).then(() => {
              this.fillFormWith(cached);
            });
          }
          else {
            this.loadPaymentInfo().then((p: any) => {
              if (p) {
                this.initTypeItemList(p.type, p.item).then(() => {
                this.fillFormWith(p);
                });
              }
            });
          }
        }
        else if(balanceId) {
          this.isEditMode = false;
          this.balanceId = parseInt(balanceId, 10);
          const today = new Date();
          this.recordDate = this.dataPipe.transform(today, 'yyyy-MM-dd')!;
          this.initTypeItemList();
        }
      });
  }

  initTypeItemList(initialType?: string, initialItem?: string): Promise<void> {
    return this.apiService.getTypeByAccount('')
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
          // 👉 初始化 selectedType 與 selectedItem
            if (initialType && this.itemMap[initialType]) {
              this.selectedType = initialType;
              this.selectedItem = initialItem || this.itemMap[initialType][0];
            } else if (this.typeList.length > 0) {
              this.selectedType = this.typeList[0];
              this.selectedItem = this.itemMap[this.selectedType][0];
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

  loadPaymentInfo(): Promise<PaymentInfos | null> {
    const account = this.authService.getCurrentUser()?.account;
    if (!account) return Promise.resolve(null);

    const payload = {
      account,
      year: new Date().getFullYear(),
      month: 0
    };

    return this.apiService.getMonthlyPaymentByFamiltBalance(payload)
      .then(res => {
        if(res.data.code == 200) {
          const list = res.data.balanceWithPaymentList.flatMap((b: any) => b.paymentInfoList);
          const found: PaymentInfos | undefined = list.find((p: PaymentInfos) => p.paymentId == this.paymentId);
          if(found) return found;
          else {
            Swal.fire('找不到資料', '指定的帳款不存在', 'error');
            this.router.navigate(['/familyLedger']);
            return null;
          }
        }
        return null;
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

  //  提取填入表單的方法
  fillFormWith(p: PaymentInfos): void {
    this.selectedType = p.type;
    this.selectedItem = p.item;
    this.description = p.description;
    this.amount = p.amount;
    this.recordDate = p.recordDate;
  }

}
