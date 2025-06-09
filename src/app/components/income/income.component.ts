import { ApiService } from './../../@services/api.service';
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Category } from '../../models/categories';
import { NavigationEnd, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../@services/payment.service';
import { filter } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-income',
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, MatIconModule,MatFormFieldModule,
    MatSelectModule, FormsModule],
  providers: [provideNativeDateAdapter()],
  standalone: true,
  templateUrl: './income.component.html',
  styleUrl: './income.component.scss'
})
export class IncomeComponent implements OnInit{

  constructor(
    private router: Router,
    private apiService: ApiService,
    private paymentService: PaymentService
  ){}


  today: Date = new Date();
  userNames: string[] = ["1", "2"];
  selectedUserName: string = this.userNames[0]; //  預設帳戶1
  type?: string;
  item?: string;
  categories: Category[] = [];
  selectedType?: string | null;  //  下拉式選單(type)
  selectedItem?: string | null;  //  下拉式選單(item)
  categoriesFiltedItems: string[] = []; //  兩層下拉式選單第二層的對象
  distinctTypes: string[] = []; //  不重複的類型
  amount?: number | null;  //  金額
  description?: string; //  款項描述
  account: string = "a6221339"; //  測試帳號
  recurringPeriodYear?: number | null; //  循環年數
  recurringPeriodMonth?: number | null; //  循環月數
  recurringPeriodDay?: number | null; //  循環天數

  ngOnInit(): void {

    this.apiService.getTypeByAccount(this.account)
      .then(res => {
        const list: Category[] = res.data.paymentTypeList || [];
        this.categories = list;

        //  去重複取得唯一的 type
        this.distinctTypes = [...new Set(list.filter(c => c.type == '收入').map(c => c.type)
        )];

        //  一定要放在 API 成功後，才有分類資料可以使用
        const saved = this.paymentService.getFormData();
        if(saved){
          this.today = new Date(saved.recordDate);
          this.recurringPeriodYear = null;
          this.recurringPeriodMonth = null;
          this.recurringPeriodDay = null;
          this.selectedUserName = saved.selectedUserName;
          this.amount = saved.amount ?? null;
          this.selectedType = saved.selectedType ?? null;
          this.selectedItem = saved.selectedItem ?? null;
          this.description = saved.description ?? '';

          //  如果有遇到類型，要重跑一次 item 下拉式選單
          if(this.selectedType){
            this.updateCategoriesFiltedItems();
          }
        }
      })
      .catch(err => {
        console.error('API error：', err);
      });

      //  偵測是否從其他頁返回
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          //  每次返回頁面都重新抓分頁資料
          this.apiService.getTypeByAccount(this.account)
          .then(res => {
            const list: Category[] = res.data.paymentTypeList || [];
            this.categories = list;
            this.distinctTypes = [...new Set(list.filter(c => c.type == '收入').map(c => c.type))];

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

  //  前往新增項目頁面
  goCreateItem(){
    //  設定 service 資料
    this.paymentService.setFormData({
      recordDate: this.today,
      recurringPeriodYear: null,
      recurringPeriodMonth: null,
      recurringPeriodDay: null,
      selectedUserName: this.selectedUserName,
      amount: this.amount ?? null,
      selectedType: this.selectedType ?? null,
      selectedItem: this.selectedItem ?? null,
      description: this.description ?? ''
    });

    this.router.navigate(['/createItem'], {
      queryParams: { from: this.router.url}
    });
  }

  //  為儲存返回首頁
  goHome(){
    this.paymentService.cleanFormData();
    this.router.navigate(['/home']);
  }

  //  儲存返回首頁
  saveAndGoHome(){
    //  檢查必要欄位
    if(!this.selectedItem || !this.selectedType || !this.amount || !this.today){
      Swal.fire({
        icon: 'warning',
        title: '資料不完整',
        text: '請確認已填寫完整資料',
        confirmButtonText: '確定'
      });
      return;
    }

    //  組成要送出的 data
    const payload = {
      balanceId: this.selectedUserName,
      description: this.description ?? '',
      type: this.selectedType,
      item: this.selectedItem,
      amount: this.amount,
      recurringPeriod: {
        year: 0,
        month: 0,
        day: 0
      },
      recordDate: this.formatDate(this.today) //  轉換後端的日期格式
    };

    //  呼叫 API
    this.apiService.createPayment(payload)
    .then(() => {
      //  成功，清空資料並跳回首頁
      Swal.fire({
        icon: 'success',
        title: '記帳成功',
        showConfirmButton: false,
        timer: 1500 //  1.5 秒自動關閉
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
