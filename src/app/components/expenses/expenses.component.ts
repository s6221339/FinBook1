import { PaymentService } from './../../@services/payment.service';
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Category } from '../../models/categories';
import { NavigationEnd, Router } from '@angular/router';
import { ApiService } from '../../@services/api.service';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';
import Swal from 'sweetalert2';
import { Balance } from '../../models/Balance';

@Component({
  selector: 'app-expenses',
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, MatIconModule,MatFormFieldModule,
    MatSelectModule, FormsModule],
  providers: [provideNativeDateAdapter()],
  standalone: true,
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent implements OnInit{

  constructor(
    private router: Router,
    private apiService: ApiService,
    private paymentService: PaymentService
  ){}

  today: Date = new Date();
  type?: string;
  item?: string;
  categories: Category[] = [];
  selectedType?: string | null;  //  下拉式選單(type)
  selectedItem?: string | null;  //  下拉式選單(item)
  categoriesFiltedItems: string[] = []; //  兩層下拉式選單第二層的對象
  distinctTypes: string[] = []; //  不重複的類型
  amount?: number | null;  //  支出金額
  description?: string; //  款項描述
  account: string = "a6221339"; //  測試帳號
  recurringPeriodYear?: number | null;  //  循環年數
  recurringPeriodMonth?: number | null; //  循環月數
  recurringPeriodDay?: number | null; //  循環天數
  balanceOptions: Balance[] = [];  //  API取得下拉式選單帳戶資料
  selectedBalanceId: number = 0;  //  實際綁定 balanceId

  ngOnInit(): void {
    //  API取得帳號type
    this.apiService.getTypeByAccount(this.account)
      .then(res => {
        const list: Category[] = res.data.paymentTypeList || [];
        this.categories = list;

        //  去重複取得唯一的 type
        this.distinctTypes = [...new Set(list.filter(c => c.type !== '收入').map(c => c.type)
        )];

        //  接著抓帳戶資料
        return this.apiService.getBalanceByAccount(this.account);
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
          this.recurringPeriodYear = null;
          this.recurringPeriodMonth = null;
          this.recurringPeriodDay = null;
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
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      //  每次返回頁面都重新抓分類資料
      this.apiService.getTypeByAccount(this.account)
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


  //  根據 selectedType 更新 categoriesFilteredItems
  updateCategoriesFiltedItems(){
    this.categoriesFiltedItems = this.categories
      .filter(c => c.type === this.selectedType)
      .map(c => c.item);
      this.selectedItem = this.categoriesFiltedItems[0];  //  預設
  }

  //  輔助函數，把 Date 轉 YYYY-MM-DD
  formatDate(date: Date): string{
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1 ).padStart(2, '0');  //  月份是 0~11
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  //  獲得帳戶名稱
  get selectedBalanceName(): string {
    const match = this.balanceOptions.find(b => b.balanceId == this.selectedBalanceId);
    return match?.name ?? '未選擇';
  }

  //  前往新增項目頁面
  goCreateItem(){
    //  設定 service 資料
    this.paymentService.setFormData({
      recordDate: this.today,
      recurringPeriodYear: null,
      recurringPeriodMonth: null,
      recurringPeriodDay: null,
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
      !this.today
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

    //  組成要送出的 data
    const payload = {
      balanceId: this.selectedBalanceId,
      description: this.description ?? '',
      type: this.selectedType,
      item: this.selectedItem,
      amount: this.amount,
      recurringPeriod: {
        year: 0,
        month: 0,
        day: 0
      },
      recordDate: this.formatDate(this.today) //  轉後端要的日期格式
    };

    //  呼叫 API
    this.apiService.createPayment(payload)
    .then(() => {
      //  成功，清空資料並跳回首頁
      Swal.fire({
        icon: 'success',
        title: '記帳成功',
        showConfirmButton: false,
        timer: 1500  // 1.5 秒自動關閉
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

