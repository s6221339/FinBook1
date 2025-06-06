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
  userNames: string[] = ["帳戶1", "帳戶2", "帳戶3"];
  selectedUserName: string = this.userNames[0]; //  預設帳戶1
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

  ngOnInit(): void {
    //  API取得帳號type
    this.apiService.getTypeByAccount(this.account)
      .then(res => {
        const list: Category[] = res.data.paymentTypeList || [];
        this.categories = list;

        //  去重複取得唯一的 type
        this.distinctTypes = [...new Set(list.filter(c => c.type !== '收入').map(c => c.type)
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

        //  如果有選過類型，要重跑一次 item 下拉式選單
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
    .subscribe(event => {
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
    this.router.navigate(['/home']);
  }
}

