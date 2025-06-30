import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../@services/api.service';
import { PaymentService } from '../../@services/payment.service';
import { Category } from '../../models/categories';
import { Balance } from '../../models/balance';
import { filter } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-fixed-income',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './fixed-income.component.html',
  styleUrl: './fixed-income.component.scss'
})
export class FixedIncomeComponent implements OnInit, AfterViewInit {
  constructor(
    private router: Router,
    private apiService: ApiService,
    private paymentService: PaymentService
  ){}

  todayString: string = '';
  private _today: Date = new Date();
  get today(): Date {
    return this._today;
  }
  set today(val: Date) {
    this._today = val;
    this.todayString = this.formatDate(val);
  }
  type?: string;
  item?: string;
  categories: Category[] = [];
  selectedType?: string | null;
  selectedItem?: string | null;
  categoriesFiltedItems: string[] = [];
  distinctTypes: string[] = [];
  amount?: number | null;
  description?: string;
  account: string = "a6221339@yahoo.com.tw";
  recurringPeriodYear: number | null = 0;
  recurringPeriodMonth: number | null = 1;
  recurringPeriodDay: number | null = 0;
  balanceOptions: Balance[] = [];
  selectedBalanceId: number = 0;
  minDate: Date = new Date();

  ngOnInit(): void {
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate() + 1);
    this.today = new Date(this.minDate);
    this.todayString = this.formatDate(this.today);
    this.apiService.getTypeByAccount(this.account)
      .then(res => {
        const list: Category[] = res.data.paymentTypeList || [];
        this.categories = list;
        this.distinctTypes = [...new Set(list.filter(c => c.type === '收入').map(c => c.type))];
        return this.apiService.getBalanceByAccount(this.account);
      })
      .then(res => {
        this.balanceOptions = res.data.balanceList || [];
        if(this.balanceOptions.length > 0) {
          this.selectedBalanceId = this.balanceOptions[0].balanceId;
        }
        const saved = this.paymentService.getFormData();
        if(saved){
          this.today = new Date(saved.recordDate);
          this.todayString = this.formatDate(this.today);
          this.recurringPeriodYear = saved.recurringPeriodYear ?? null;
          this.recurringPeriodMonth = saved.recurringPeriodMonth ?? null;
          this.recurringPeriodDay = saved.recurringPeriodDay ?? null;
          this.selectedBalanceId = saved.selectedBalanceId ?? this.selectedBalanceId;
          this.amount = saved.amount ?? null;
          this.selectedType = saved.selectedType ?? null;
          this.selectedItem = saved.selectedItem ?? null;
          this.description = saved.description ?? '';
          if(this.selectedType){
            this.updateCategoriesFiltedItems();
          }
        }
      })
      .catch(err => {
        console.error('初始化錯誤', err);
      });
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.apiService.getTypeByAccount(this.account)
        .then(res => {
          const list: Category[] = res.data.paymentTypeList || [];
          this.categories = list;
          this.distinctTypes = [...new Set(list.filter(c => c.type === '收入').map(c => c.type))];
          if(this.selectedType){
            this.updateCategoriesFiltedItems();
          }
        });
      });
  }

  ngAfterViewInit(): void {
    // 禁止滑鼠滾輪和上下鍵改變循環週期 input 數值
    const periodInputs = document.querySelectorAll('.period-number') as NodeListOf<HTMLInputElement>;
    periodInputs.forEach(input => {
      input.addEventListener('wheel', (e) => input.blur());
      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
        }
      });
    });
  }

  updateCategoriesFiltedItems(){
    this.categoriesFiltedItems = this.categories
      .filter(c => c.type === this.selectedType)
      .map(c => c.item);
    this.selectedItem = this.categoriesFiltedItems[0];
  }

  formatDate(data: Date): string{
    const year = data.getFullYear();
    const month = String(data.getMonth() + 1).padStart(2, '0');
    const day = String(data.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get selectedBalanceName(): string {
    const match = this.balanceOptions.find(b => b.balanceId == this.selectedBalanceId);
    return match?.name ?? '未選擇';
  }

  goCreateItem(){
    this.paymentService.setFormData({
      recordDate: this.today,
      recurringPeriodYear: this.recurringPeriodYear ?? null,
      recurringPeriodMonth: this.recurringPeriodMonth ?? null,
      recurringPeriodDay: this.recurringPeriodDay ?? null,
      selectedBalanceId: this.selectedBalanceId,
      amount: this.amount ?? null,
      selectedType: this.selectedType ?? null,
      selectedItem: this.selectedItem ?? null,
      description: this.description ?? ''
    });
    this.router.navigate(['/createItem'], {
      queryParams: { from: this.router.url}
    });
  }

  goHome(){
    this.paymentService.cleanFormData();
    this.router.navigate(['/home']);
  }

  saveAndGoHome(){
    if(
      !this.selectedItem ||
      !this.selectedType ||
      this.amount == null ||
      !this.today ||
      this.recurringPeriodYear == null ||
      this.recurringPeriodMonth == null ||
      this.recurringPeriodDay == null
    ){
      Swal.fire({
        icon: 'warning',
        title: '資料不完整',
        text: '請確認已填寫完整資料',
        confirmButtonText: '確定'
      });
      return;
    }
    if(this.amount <= 0){
      Swal.fire({
        icon: 'warning',
        title: '金額不得為 0 ',
        text: '請確認填寫正確金額',
        confirmButtonText: '確定'
      });
      return;
    }
    if(
      this.recurringPeriodYear == 0 &&
      this.recurringPeriodMonth == 0 &&
      this.recurringPeriodDay == 0
    ) {
      Swal.fire({
        icon: 'warning',
        title: '循環週期錯誤',
        text: '循環週期的年、月、日不能同時為 0',
        confirmButtonText: '確定'
      });
      return;
    }
    const payload = {
      balanceId: this.selectedBalanceId,
      description: this.description ?? '',
      type: this.selectedType,
      item: this.selectedItem,
      amount: this.amount,
      recurringPeriod: {
        year: this.recurringPeriodYear,
        month: this.recurringPeriodMonth,
        day: this.recurringPeriodDay
      },
      recordDate: this.formatDate(this.today)
    };
    this.apiService.createPayment(payload)
    .then(() => {
      Swal.fire({
        icon: 'success',
        title: '記帳成功',
        showConfirmButton: false,
        timer: 1500
      });
      this.paymentService.cleanFormData();
      this.router.navigate(['/home']);
    })
    .catch(err => {
      console.error('儲存失敗', err);
      Swal.fire({
        icon: 'error',
        title: '儲存失敗',
        text: '請稍後再試',
        confirmButtonText: '確定'
      });
    });
  }
}
