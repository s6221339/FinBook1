import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Category } from '../../models/categories';
import { Router } from '@angular/router';

@Component({
  selector: 'app-income',
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, MatIconModule,MatFormFieldModule,
    MatSelectModule],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  templateUrl: './income.component.html',
  styleUrl: './income.component.scss'
})
export class IncomeComponent implements OnInit{

  constructor(
    private router: Router
  ){}


  today: Date = new Date();
  userNames: string[] = ["帳戶1", "帳戶2", "帳戶3"];
  selectedUserName: string = this.userNames[0]; //  預設帳戶1
  type?: string;
  item?: string;
  categories: Category[] = [{type: "收入", item: "利息"}, {type: "收入", item: "投資"}, {type: "收入", item: "獎金"}, {type: "收入", item: "薪資"}];
  selectedType?: string;  //  下拉式選單(type)
  selectedItem?: string;  //  下拉式選單(item)
  categoriesFiltedItems: string[] = []; //  兩層下拉式選單第二層的對象
  distinctTypes: string[] = []; //  不重複的類型
  recurringPeriod?: number; //  循環週期
  amount?: number;  //  金額
  description?: string; //  款項描述

  ngOnInit(): void {
    //  只選取唯一值type
    //  Set為集合，自動排除重複使用
    //  ...展開運算子（Spread Operator）
    this.distinctTypes = [...new Set(this.categories.map(c => c.type))];
  }


  //  根據 selectedType 更新 categoriesFilteredItems
  updateCategoriesFiltedItems(){
    this.categoriesFiltedItems = this.categories
      .filter(c => c.type === this.selectedType)
      .map(c => c.item);
      this.selectedItem = this.categoriesFiltedItems[0];  //  預設
  }

  goCreateItem(){
    this.router.navigate(['/createitem']);
  }

  goHome(){
    this.router.navigate(['/home']);
  }

  saveAndGoHome(){
    this.router.navigate(['/home']);
  }

}
