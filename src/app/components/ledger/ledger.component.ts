import { ApiService } from './../../@services/api.service';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PaymentIdFormData } from '../../models/paymentIdFormData';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/categories';

@Component({
  selector: 'app-ledger',
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, MatIconModule,MatFormFieldModule,
    MatSelectModule, FormsModule, MatButtonModule, CommonModule],
  providers: [provideNativeDateAdapter()],
  standalone: true,
  templateUrl: './ledger.component.html',
  styleUrl: './ledger.component.scss'
})
export class LedgerComponent implements AfterViewInit,OnInit{

  constructor(
    private apiService: ApiService
  ){}

  @ViewChild('batteryFill') batteryFillElement!: ElementRef<SVGRectElement>;
  @ViewChild('batteryPercentText') batteryPercentTextElement!: ElementRef<SVGTextElement>;
  userNames: string[] = ["1", "2"]; //  帳戶下拉式選單
  selectedUserName: string = this.userNames[0]; //  預設帳戶1;
  year: number = new Date().getFullYear(); //  預設帳戶時間（年）
  month: number = new Date().getMonth() + 1;  //  預設帳戶時間（月）
  years: number[] = []; //  年份列表
  months: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; //  月份列表
  budget?: number;  //  預算
  fixedIncome?: number; //  固定收入
  fixedExpenses?: number; // 固定支出
  savings?: number; //  儲蓄
  income?: number;  //  收入
  expenses?: number;  //  支出
  balance?: number; //  餘額
  isEditingBudget: boolean = false;
  isSavingsSet: boolean = false;
  testData: PaymentIdFormData[] = [
    {
      paymentId: 1,
      type: '交通',
      item: '停車費',
      description: '崑山停車場',
      amount: 100,
      recurringPeriodYear: 0,
      recurringPeriodMonth: 0,
      recurringPeriodDay: 0,
      recordDate: new Date('2025-06-01')
    },
    {
      paymentId: 2,
      type: '其他',
      item: '禮物',
      description: '送羊羊的禮物',
      amount: 700,
      recurringPeriodYear: 0,
      recurringPeriodMonth: 0,
      recurringPeriodDay: 0,
      recordDate: new Date('2025-06-02')
    },
    {
      paymentId: 3,
      type: '娛樂',
      item: '遊戲',
      description: '楓之谷',
      amount: 3000,
      recurringPeriodYear: 0,
      recurringPeriodMonth: 0,
      recurringPeriodDay: 0,
      recordDate: new Date('2025-06-03')
    },
    {
      paymentId: 4,
      type: '居家',
      item: '網路費',
      description: '中華電信光世代',
      amount: 1099,
      recurringPeriodYear: 0,
      recurringPeriodMonth: 1,
      recurringPeriodDay: 0,
      recordDate: new Date('2025-06-12')
    },
    {
      paymentId: 5,
      type: '收入',
      item: '薪資',
      description: '每月薪水',
      amount: 50000,
      recurringPeriodYear: 0,
      recurringPeriodMonth: 1,
      recurringPeriodDay: 0,
      recordDate: new Date('2025-06-15')
    },
    {
      paymentId: 6,
      type: '教育',
      item: '線上課程',
      description: '巨匠分期',
      amount: 3000,
      recurringPeriodYear: 0,
      recurringPeriodMonth: 1,
      recurringPeriodDay: 0,
      recordDate: new Date('2025-06-16')
    },
    {
      paymentId: 7,
      type: '消費',
      item: '鞋子',
      description: '買布鞋一雙',
      amount: 4000,
      recurringPeriodYear: 0,
      recurringPeriodMonth: 0,
      recurringPeriodDay: 0,
      recordDate: new Date('2025-06-04')
    }
  ]
  selectedType?: string | null;  //  下拉式選單(type)
  selectedItem?: string | null;  //  下拉式選單(item)
  categoriesFiltedItems: string[] = []; //  兩層下拉式選單第二層的對象
  categories: Category[] = [];
  distinctTypes: string[] = []; //  不重複的類型
  account: string = "a6221339";

  ngOnInit(): void {
    //  初始化年份選單列表
    this.generateYears();
    //  API取得帳號type
    this.apiService.getTypeByAccount(this.account)
      .then(res => {
        const list: Category[] = res.data.paymentTypeList || [];
        this.categories = list;

        //  去重複取得唯一的 type
        this.distinctTypes = [...new Set(list.map(c => c.type)
        )];
      })
      .catch(err => {
        console.error('API error：', err);
      });


  }

  ngAfterViewInit(): void {
    this.updateBattery(1);
  }

  updateBattery(budgetPercentRemaining: number): void {
    const batteryFillElement = this.batteryFillElement.nativeElement;
    const batteryPercentText = this.batteryPercentTextElement.nativeElement;

    // 最大高度 176px
    const batteryMaxHeight = 176;

    // 特殊處理：如果 < 0，整顆反紅
    if (budgetPercentRemaining < 0) {
      batteryFillElement.setAttribute('height', batteryMaxHeight.toString());
      batteryFillElement.setAttribute('y', '12');
      batteryFillElement.setAttribute('fill', '#d50000'); // 純紅色（你也可用 #f44336 看起來更亮）

      // 👉 加這行讓電池有閃爍紅色動畫
      batteryFillElement.setAttribute('class', 'alert-red');

      // 顯示實際超支 % 數，帶上警告符號
      batteryPercentText.textContent = `${Math.round(budgetPercentRemaining)}%`;

      return; // 直接 return，後面就不跑 gradient 部分了
    }

    // 超過 100% → 整顆綠色 + 閃爍
    if (budgetPercentRemaining > 100) {
      batteryFillElement.setAttribute('height', batteryMaxHeight.toString());
      batteryFillElement.setAttribute('y', '12');
      batteryFillElement.setAttribute('fill', '#2e7d32'); // 綠色
      batteryFillElement.setAttribute('class', 'alert-green'); // 套綠色閃爍

      batteryPercentText.textContent = `${Math.round(budgetPercentRemaining)}%`;
      return;
    }

    const newHeight = Math.max(0, Math.min((budgetPercentRemaining / 100) * batteryMaxHeight, batteryMaxHeight));
    const newY = 12 + (batteryMaxHeight - newHeight);

    batteryFillElement.setAttribute('height', newHeight.toString());
    batteryFillElement.setAttribute('y', newY.toString());

    // 百分比文字
    batteryPercentText.textContent = `${Math.round(budgetPercentRemaining)}%`;

    // 改 gradient stop color
    const gradient = document.querySelector<SVGLinearGradientElement>('#batteryGradient');
    if (!gradient) return; // 防止找不到時報錯
    const stops = gradient.querySelectorAll('stop');

    let color1 = '#76ff03'; // default green
    let color2 = '#4caf50';

    // 根據範圍決定顏色
  if (budgetPercentRemaining == 100) {
    // 100% → 更深綠漸層
    color1 = '#4caf50';
    color2 = '#388e3c';

    // 保證正常狀態時不殘留 alert-red class
  batteryFillElement.removeAttribute('class');
  } else if (budgetPercentRemaining > 50) {
    color1 = '#76ff03';
    color2 = '#4caf50';

    // 保證正常狀態時不殘留 alert-red class
  batteryFillElement.removeAttribute('class');
  } else if (budgetPercentRemaining > 20) {
    color1 = '#ffeb3b';
    color2 = '#fdd835';

    // 保證正常狀態時不殘留 alert-red class
  batteryFillElement.removeAttribute('class');
  } else if (budgetPercentRemaining >= 0){
    color1 = '#f44336';
    color2 = '#e53935';

    // 保證正常狀態時不殘留 alert-red class
  batteryFillElement.removeAttribute('class');
  }

    stops[0].setAttribute('stop-color', color1);
    stops[1].setAttribute('stop-color', color2);

    // 保證 batteryFillElement fill 用 gradient（避免前一次被改成單色）
    batteryFillElement.setAttribute('fill', 'url(#batteryGradient)');
  }

  //  產生年份列表
  generateYears(): void {
    const currentYear = new Date().getFullYear();
    const startYear = 1970;
    this.years = [];

    for(let y = currentYear; y >= startYear; y--) {
      this.years.push(y);
    }
  }

  //  開始編輯儲蓄
  startEditBudget(){
    this.isEditingBudget = true;
  }

  //  儲存儲蓄
  saveBudget(){
    this.isEditingBudget = false;

    if(this.savings == null || isNaN(this.savings as any)) {
      this.savings = 0;
    }
    else if(this.savings < 0){
      this.savings = 0;
    }
    else{
      //  避免小數：無條件捨去向下取整數
      this.savings = Math.floor(this.savings);
    }

    this.isSavingsSet = true;
    this.isEditingBudget = false;
  }

  //  取消編輯儲蓄
  cancelEditBudget(){
    this.isEditingBudget = false;
  }

  //  根據 selectedType 更新 categoriesFilteredItems
  updateCategoriesFiltedItems(){
    this.categoriesFiltedItems = this.categories
      .filter(c => c.type === this.selectedType)
      .map(c => c.item);
      this.selectedItem = this.categoriesFiltedItems[0];  //  預設
  }

  //
  get filteredTestData(): PaymentIdFormData[] {
    return this.testData.filter(t =>
      (!this.selectedType || t.type?.includes(this.selectedType!)) &&
      (!this.selectedItem || t.item?.includes(this.selectedItem!))
    );
  }

}
