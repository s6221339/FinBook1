import { PaymentService } from './../../@services/payment.service';
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Category } from '../../models/categories';
import { Router } from '@angular/router';
import { ApiService } from '../../@services/api.service';

@Component({
  selector: 'app-expenses',
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, MatIconModule,MatFormFieldModule,
    MatSelectModule],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  selectedType?: string;  //  下拉式選單(type)
  selectedItem?: string;  //  下拉式選單(item)
  categoriesFiltedItems: string[] = []; //  兩層下拉式選單第二層的對象
  distinctTypes: string[] = []; //  不重複的類型
  amount?: number;  //  支出金額
  description?: string; //  款項描述
  account: string = "a6221339"; //  測試帳號

  ngOnInit(): void {

    this.apiService.getTypeByAccount(this.account)
      .then(res => {
        const list: Category[] = res.data.paymentTypeList || [];
        this.categories = list;

        //  去重複取得唯一的 type
        this.distinctTypes = [...new Set(list.filter(c => c.type !== '收入').map(c => c.type))];
      })
      .catch(err => {
        console.error('API error：', err);
      });
  }


  //  根據 selectedType 更新 categoriesFilteredItems
  updateCategoriesFiltedItems(){
    this.categoriesFiltedItems = this.categories
      .filter(c => c.type === this.selectedType)
      .map(c => c.item);
      this.selectedItem = this.categoriesFiltedItems[0];  //  預設
  }

  goCreateItem(){
    this.paymentService.setFormData({
      date: this.today,
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

  goHome(){
    this.router.navigate(['/home']);
  }

  saveAndGoHome(){
    this.router.navigate(['/home']);
  }
}
