import { AuthService } from './../../@services/auth.service';
import { PaymentModifiedService } from './../../@services/payment-modified.service';
import { ApiService } from './../../@services/api.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentIdFormData } from '../../models/paymentIdFormData';
import { Category } from '../../models/categories';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-payment',
  imports: [MatFormFieldModule, MatSelectModule, FormsModule, MatOptionModule, MatInputModule, MatDatepickerModule],
  templateUrl: './edit-payment.component.html',
  providers: [provideNativeDateAdapter()],
  styleUrl: './edit-payment.component.scss',
  standalone: true
})
export class EditPaymentComponent implements OnInit, AfterViewInit{

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentModifiedService: PaymentModifiedService,
    private apiService: ApiService,
    private authService: AuthService
  ){}

  paymentId!: number;
  account: string= '';
  paymentData!: PaymentIdFormData;
  categories: Category[] = [];
  filteredItems: string[] = []; //  根據 type 篩選過的 item
  selectedType: string | null = null;
  selectedItem: string | null = null;
  description: string = '';
  amount: number | null = null;
  recordDate: Date = new Date();
  recordDateStr: string = '';
  distinctTypes: string[] = []; //  篩選不重複 type
  today = new Date();
  currentYear = this.today.getFullYear(); //  現在年分
  currentMonth = this.today.getMonth() +1;  //  現在月份
  currentDay = this.today.getDate();  //  現在幾號
  recurringYear: number | null = this.currentYear;
  recurringMonth: number | null = this.currentMonth;
  recurringDay: number | null = this.currentDay;
  canEditAll: boolean = true; //  控制是否可編輯
  canEditRecurring: boolean = true; //  控制「循環週期」欄位是否可編輯
  fromPage: string = '/modifyPayment';  //  預設返回頁
  originalIsRecurring: boolean = false;
  isFutureRecordDate: boolean = false;
  datePickerMin: string = '';
  datePickerMax: string = '';

  ngOnInit(): void {
    //  從 AuthService 取得登入使用者帳號
    const user = this.authService.getCurrentUser();
    if(!user) {
      Swal.fire('錯誤', '尚未登入，請重新登入', 'error');
      this.router.navigate(['/login']);
      return;
    }
    this.account = user.account;

    //  加：取得 URL 中的來源頁參數 ?from=xxx
    const from = this.route.snapshot.queryParamMap.get('from');
    this.fromPage = from ? `/${from}` : '/modifyPayment'; //  預設為 modifyPayment

    //  取得 URL 中的 paymentId
    const id = this.route.snapshot.queryParamMap.get('paymentId');
    if(id){
      this.paymentId = +id;
      //  根據 paymentId 撈資料進行編輯
    }
    else{
      Swal.fire({
        icon: 'warning',
        title: '錯誤',
        text: '未傳入要編輯的 paymentId',
        confirmButtonText: '確定'
      });
      this.router.navigate([this.fromPage]);  //  導回來源頁
      return;
    }

    //  從 service 拿暫存資料
    const data = this.paymentModifiedService.getPaymentFormData();

    if(!data){
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '找不到要編輯的資料',
        confirmButtonText: '確定'
      });
      this.router.navigate(['/modifyPayment']);
      return;
    }

    this.paymentData = data;

    //  計算今天日期
    this.today = new Date;
    this.currentYear = this.today.getFullYear();
    this.currentMonth = this.today.getMonth() + 1;
    this.currentDay = this.today.getDate();

    //  預設值設定
    this.selectedItem = data.item;
    this.description = data.description;
    this.amount = data.amount;
    this.recurringYear = data.recurringPeriodYear;
    this.recurringMonth = data.recurringPeriodMonth;
    this.recurringDay = data.recurringPeriodDay;
    this.recordDate = new Date(data.recordDate);
    this.recordDateStr = this.formatDataToLocalString(this.recordDate);

    //  ?? 是空值合併運算子，表示如果左邊是 null 或 undefined，就用右邊的值。
    //  是否是非循環週期，判斷表單可否編輯
    const isRecurringZero =
      (this.recurringYear ?? 0) == 0 &&
      (this.recurringMonth ?? 0) == 0 &&
      (this.recurringDay ?? 0) == 0;

    const today = new Date();
    const recordDate = new Date(data.recordDate);
    today.setHours(0, 0, 0, 0);
    recordDate.setHours(0, 0, 0, 0);

    //  判斷紀錄時間是否是未來，判斷循環是否可開決定可否編輯
    const isFuture = recordDate > today;

    //  記憶原始狀態
    this.originalIsRecurring = !isRecurringZero;
    this.isFutureRecordDate = isFuture;

    //  循環 + 日期條件邏輯整合
    if(!this.originalIsRecurring) {
      //  非循環帳款
      this.canEditAll = true;
      this.canEditRecurring = false;
      this.setDatePickerRange('pastOnly');
    }
    else if (this.originalIsRecurring && !this.isFutureRecordDate) {
      //  循環帳款 + 今天或過去
      this.canEditAll = true;
      this.canEditRecurring = false;
      this.setDatePickerRange('pastOnly');
    }
    else{
      //  循環帳款 + 未來
      this.canEditAll = true;
      this.canEditRecurring = true;
      this.setDatePickerRange('futureOnly');
    }

    //  取得所有分類資料供下拉式選單使用
    this.apiService.getTypeByAccount(this.account)
    .then(res => {
      this.categories = res.data.paymentTypeList || [];

      //  初始化類型下拉式選單（distinct）
      this.distinctTypes = [...new Set(this.categories.map(c => c.type))];

      //  類型載入後再設 selectedType 避免錯誤
      this.selectedType = data.type
      this.updateItemOptions();
    })
    .catch(err => {
      console.error('載入分類資料錯誤', err);
    });
  }

  ngAfterViewInit(): void {
    // 金額 input 防滾輪/上下鍵
    const input = document.querySelector('.amount-input[type="number"]') as HTMLInputElement;
    if (input) {
      input.addEventListener('wheel', () => input.blur());
      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
        }
      });
    }
  }

  setDatePickerRange(mode: 'pastOnly' | 'futureOnly') {
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = today.getFullYear();
    const mm = pad(today.getMonth() + 1);
    const dd = pad(today.getDate());
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if(mode == 'pastOnly') {
      this.datePickerMin = '2001-01-01';
      this.datePickerMax = todayStr;
    }
    else if(mode == 'futureOnly') {
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      const y = tomorrow.getFullYear();
      const m = pad(tomorrow.getMonth() + 1);
      const d = pad(tomorrow.getDate());
      this.datePickerMin = `${y}-${m}-${d}`;
      this.datePickerMax = '';
    }
  }

  //  根據選擇的 type 更新下拉式選單的 item
  updateItemOptions(): void {
    this.filteredItems = this.categories
      .filter(c => c.type == this.selectedType)
      .map(c => c.item);
  }

  //  將日期轉換成 yyyy-mm-dd 字串
  private formatDataToLocalString(date: Date): string {
    //  手動轉字串未滿兩位則補 0
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    return `${yyyy}-${mm}-${dd}`;
  }

  get showRecurringFields(): boolean {
    //  不再即時根據 recurringXXX 判斷，而是記憶初始是否為循環帳款
    return this.originalIsRecurring;
  }

  //  取消回修改帳款頁面
  goBackModifyPayment(){
    this.paymentModifiedService.cleanPaymentFormData();
    this.router.navigate([this.fromPage]);  //  導回來源頁
  }

  onRecordDateChange(dateStr: string) {
    this.recordDateStr = dateStr;
    this.recordDate = new Date(dateStr);
  }

  //  儲存並返回
  saveAndGoBack(){
    //  檢查必要欄位
    if(!this.canEditAll) return;

    if(!this.selectedItem ||
       !this.selectedType ||
       this.amount == null ||
       !this.recordDate
    ){
      Swal.fire({
        icon: 'warning',
        title: '資料不完整',
        text: '請確認已填寫完整資料',
        confirmButtonText: '確定'
      });
      return;
    }

    //  檢查餘額不得為 0
    if(this.amount <= 0){
      Swal.fire({
        icon: 'warning',
        title: '金額不得為 0 或負數',
        text: '請確認填寫正確金額',
        confirmButtonText: '確定'
      });
      return;
    }

    const year = this.recurringYear ?? 0;
    const month = this.recurringMonth ?? 0;
    const day = this.recurringDay ?? 0;

    //  小數防呆
    if(!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)){
      Swal.fire({
        icon: 'warning',
        title: '請輸入整數',
        text: '循環週期的年/月/日不可為小數',
        confirmButtonText: '確定'
      });
      return;
    }

    //  驗證循環週期不得為負
    if( year < 0 || month < 0 || day < 0){
      Swal.fire({
        icon: 'warning',
        title: '循環週期不得為負數',
        text: '請檢察年、月、日的輸入值',
        confirmButtonText: '確定'
      });
      return;
    }

    const updatePayload = {
      paymentId: this.paymentId,
      description: this.description,
      type: this.selectedType,
      item: this.selectedItem,
      amount: this.amount,
      recurringPeriod: {
        year,
        month,
        day
      },
      recordDate: this.recordDateStr
    };

    this.apiService.updatePayment(updatePayload)
    .then(() => {
      Swal.fire({
        icon: 'success',
        title: '儲存成功',
        confirmButtonText: '返回'
      }).then(() => {
        this.paymentModifiedService.cleanPaymentFormData();
        this.router.navigate([this.fromPage]);
      });
    })
    .catch(err => {
      console.error('更新失敗', err);
      Swal.fire({
        icon: 'error',
        title: '儲存失敗',
        text: '請稍後再試',
        confirmButtonText: '確定'
      });
    });
  }

}
