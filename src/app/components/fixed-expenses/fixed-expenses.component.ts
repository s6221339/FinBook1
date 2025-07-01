import { AuthService } from './../../@services/auth.service';
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
  selector: 'app-fixed-expenses',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './fixed-expenses.component.html',
  styleUrl: './fixed-expenses.component.scss'
})
export class FixedExpensesComponent implements OnInit, AfterViewInit {

  constructor(
    private router: Router,
    private apiService: ApiService,
    private paymentService: PaymentService,
    private authService: AuthService
  ){}

  todayString: string = this.formatDate(new Date());
  type?: string;
  item?: string;
  categories: Category[] = [];
  selectedType?: string | null;  //  下拉式選單(type)
  selectedItem?: string | null;  //  下拉式選單(item)
  categoriesFiltedItems: string[] = []; //  兩層下拉式選單第二層的對象
  distinctTypes: string[] = []; //  不重複的類型
  amount?: number | null;  //  金額
  description?: string; //  款項描述
  recurringPeriodYear: number | null = 0;  //  循環年數
  recurringPeriodMonth: number | null = 0; //  循環月數
  recurringPeriodDay: number | null = 0; //  循環天數
  balanceOptions: Balance[] = [];  //  API取得下拉式選單帳戶資料
  selectedBalanceId: number = 0;  //  實際綁定 balanceId
  minDate: Date = new Date(); //  固定帳款最小能選擇日期

  ngOnInit(): void {
    //  設定首次生效日期不可為今天，需為明天起
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate() + 1);
    this.today = new Date(this.minDate);  //  預設 today 為明天
    this.todayString = this.formatDate(this.today);

    //  API取得帳號type
    this.apiService.getTypeByAccount(this.currentAccount)
      .then(res => {
        const list: Category[] = res.data.paymentTypeList || [];
        this.categories = list;

        //  去重複取得唯一的 type 且不包含 type 為收入的
        this.distinctTypes = [...new Set(list.filter(c => c.type !== '收入').map(c => c.type)
        )];

        //  接著抓帳戶資料
        return this.apiService.getBalanceByAccount(this.currentAccount);
      })
      .then(res => {
        this.balanceOptions = res.data.balanceList || [];

        //  若有帳戶，預設選第一筆
        if(this.balanceOptions.length > 0) {
          this.selectedBalanceId = this.balanceOptions[0].balanceId;
        }

        //  一定要放在 API 成功後，才有分類資料可以使用
        const saved = this.paymentService.getFormData();
        if(saved){
          this.today = new Date(saved.recordDate);
          this.todayString = this.formatDate(new Date(saved.recordDate));
          this.recurringPeriodYear = saved.recurringPeriodYear ?? null;
          this.recurringPeriodMonth = saved.recurringPeriodMonth ?? null;
          this.recurringPeriodDay = saved.recurringPeriodDay ?? null;
          this.selectedBalanceId = saved.selectedBalanceId ?? this.selectedBalanceId;
          this.amount = saved.amount ?? null;
          this.selectedType = saved.selectedType ?? null;
          this.selectedItem = saved.selectedItem ?? null;
          this.description = saved.description ?? '';

          //  如果有選過類型，要重跑一次 item 下拉式選單
          if(this.selectedType){
            this.updateCategoriesFiltedItems();
          }
        }
      })
      .catch(err => {
        console.error('初始化錯誤', err);
      });

      //  偵測是否從其他頁返回
    this.router.events
      /**
       * .pipe() 匯集資料資料流轉給 subscribe
       * @param event 導航結束的事件
      */
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        //  每次返回頁面都重新抓分類資料
        this.apiService.getPaymentByAccount(this.currentAccount)
        .then(res => {
          const list: Category[] = res.data.paymentTypeList || [];
          this.categories = list;
          this.distinctTypes = [...new Set(list.filter(c => c.type !== '收入').map(c => c.type))];

          //  若之前有選過分類，則重跑選項選單
          if(this.selectedType){
            this.updateCategoriesFiltedItems();
          }
        });
      });
  }

  get currentAccount(): string {
    const user = this.authService.getCurrentUser();
    if(!user) {
      Swal.fire('錯誤', '尚未登入，請重新登入', 'error');
      this.router.navigate(['/login']);
      throw new Error('尚未登入');
    }
    return user.account;
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

  // 監聽 today 變動自動更新 todayString
  get today(): Date {
    return new Date(this.todayString)
  }
  set today(val: Date) {
    this.todayString = this.formatDate(val);
  }

  //  根據 selectedType 更新 categoriesFilteredItems
  updateCategoriesFiltedItems(){
    this.categoriesFiltedItems = this.categories
      .filter(c => c.type === this.selectedType)
      .map(c => c.item);
      this.selectedItem = this.categoriesFiltedItems[0];  //  預設
  }

  //  輔助函數，把 Date 轉 YYYY-MM-DD
  formatDate(data: Date): string{
    const year = data.getFullYear();
    /*
    * .padStart(a, b ) 屬於字串用法,若長度小於 a ,則在前面補上b
    */
    const month = String(data.getMonth() + 1).padStart(2, '0'); //  月份是 0~11
    const day = String(data.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  //  獲得帳戶名稱
  get selectedBalanceName(): string {
    const match = this.balanceOptions.find(b => b.balanceId == this.selectedBalanceId);
    return match?.name ?? '未選擇';
  }

  //  前往新項目頁面
  goCreateItem(){
    //  設定 service 資料
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

  //  未儲存返回首頁
  goHome(){
    this.paymentService.cleanFormData();
    this.router.navigate(['/home']);
  }

  //  儲存返回首頁
  saveAndGoHome(){
    //  檢查必要欄位
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

    //  檢查餘額不得為 0
    if(this.amount <= 0){
      Swal.fire({
        icon: 'warning',
        title: '金額不得為 0 ',
        text: '請確認填寫正確金額',
        confirmButtonText: '確定'
      });
      return;
    }

    //  檢查 年/月/日 不得同時為 0
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

    //  組成要送出的 data
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
      recordDate: this.todayString //  轉後端要的日期格式
    };

    //  呼叫 API
    this.apiService.createPayment(payload)
    .then(() => {
      //  成功，清空資料並跳回首頁
      Swal.fire({
        icon: 'success',
        title: '記帳成功',
        showConfirmButton: false,
        timer: 1500 // 1.5 秒自動關閉
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
