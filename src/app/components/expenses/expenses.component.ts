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
    private router: Router
  ){}

  today: Date = new Date();
  userNames: string[] = ["帳戶1", "帳戶2", "帳戶3"];
  selectedUserName: string = this.userNames[0]; //  預設帳戶1;
  type?: string;
  item?: string;
  categories: Category[] = [{type: "交通", item: "停車費"}, {type: "交通", item: "火車月卡"}, {type: "交通", item: "加油費用"}, {type: "其他", item: "交際應酬"}, {type: "娛樂", item: "KTV"}];
  selectedType?: string;  //  下拉式選單(type)
  selectedItem?: string;  //  下拉式選單(item)
  categoriesFiltedItems: string[] = []; //  兩層下拉式選單第二層的對象
  distinctTypes: string[] = []; //  不重複的類型

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

}
