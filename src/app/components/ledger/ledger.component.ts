import { AuthService } from './../../@services/auth.service';
import { PaymentFormData } from './../../models/paymentFormData';
import { ApiService } from './../../@services/api.service';
import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
import { PaymentType } from '../../models/paymentType';
import { Balance } from '../../models/balance';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { CustomPaginatorComponent } from '../custom-paginator/custom-paginator.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-ledger',
  imports: [
    MatFormFieldModule, MatInputModule, MatDatepickerModule, MatIconModule, MatFormFieldModule,
    MatSelectModule, FormsModule, MatButtonModule, CommonModule, MatTooltipModule,
    MatTableModule, MatSortModule, CustomPaginatorComponent,MatCardModule
  ],
  providers: [provideNativeDateAdapter()],
  standalone: true,
  templateUrl: './ledger.component.html',
  styleUrl: './ledger.component.scss'
})
export class LedgerComponent implements OnInit, AfterViewInit{

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ){}

  @ViewChild('batteryFill') batteryFillElement!: ElementRef<SVGRectElement>;
  @ViewChild('batteryPercentText') batteryPercentTextElement!: ElementRef<SVGTextElement>;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('tableContainer') tableContainer!: ElementRef<HTMLElement>;
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
  isEditingBudget: boolean = false; //  是否編輯儲蓄
  isSavingsSet: boolean = false;  //  儲蓄是否被重新設定過
  selectedType?: string | null;  //  下拉式選單(type)
  selectedItem?: string | null;  //  下拉式選單(item)
  categoriesFilteredItems: string[] = []; //  兩層下拉式選單第二層的對象
  categories: PaymentType[] = [];
  distinctTypes: string[] = []; //  不重複的類型
  selectedRecordDate?: Date | null; //  目前選擇的紀錄日期
  selectedRecordDateStr: string | null = null;
  monthStartDate: Date = new Date(this.year, this.month-1, 1);  //  日期選擇器篩選表格開始日期
  monthEndDate: Date = new Date(this.year, this.month, 0);  //  日期選擇器篩選表格結束日期
  budgetList: any[] = [];  //  存 API 回傳 budgetList ，給統計用
  selectedBalanceId?: number = 0; //  使用者選擇的 balanceId
  balanceList: Balance[] = [];  //  透過帳號取得帳戶給下拉式選單用
  rawPaymentList: any[] = []; //  原始 API 回傳的 balanceWithPaymentList
  todayString: string = '';

  //  分頁控制
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalFilteredItems: number = 0;
  dataSource = new MatTableDataSource<PaymentIdFormData>();
  allFilteredData: (PaymentIdFormData & { isRecurring?: string })[] = [];

  ngOnInit(): void {
    //  設定今天自串供日期選擇器使用（格式 yyyy-MM-dd）
    this.todayString = new Date().toISOString().slice(0, 10);

    //  初始化年份選單列表
    this.generateYears();
    this.generateMonths();
    this.updateMonthRange();

    //  取得 balanceList ，因下拉式選單要用
    this.apiService.getBalanceByAccount(this.currentAccount)
      .then(res => {
        this.balanceList = res.data.balanceList || [];

        //  若有帳戶，預設選第一筆
        if(this.balanceList.length > 0){
          this.selectedBalanceId = this.balanceList[0].balanceId;
        }

        //  在撈分類資料
        return this.apiService.getTypeByAccount(this.currentAccount);
      })
      .then(res => {
        const list: PaymentType[] = res.data.paymentTypeList || [];
        this.categories = list;

        //  去重複取得唯一的 type
        this.distinctTypes = ['全部', ...new Set(list.map(c => c.type)
        )];

        //  設定預設值「全部」
        this.selectedType = '全部';

        //  初始化 item 清單為「全部」
        this.updateCategoriesFiltedItems();
      })
      .catch(err => {
        console.error('初始化錯誤', err);
      });

      this.loadSavingsFromAllPayments();
      //  撈預算資料
      this.loadBudgetData();
      this.loadPayments();
      this.updateTotalFilteredItems();
      this.updateDataSource();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.sort.sortChange.subscribe(() => {
      this.currentPage = 1;
      this.applyFilters();
    });
  }

  get currentAccount(): string {
    const user = this.authService.getCurrentUser();
    if(!user) {
      this.router.navigate(['/login']);
      throw new Error('尚未登入');
    }
    return user.account;
  }

  updateBattery(budgetPercentRemaining: number, isPositive: boolean): void {
    const batteryFillElement = this.batteryFillElement.nativeElement;
    const batteryPercentText = this.batteryPercentTextElement.nativeElement;

    // 最大高度 176px
    const batteryMaxHeight = 176;

    // 特殊處理：如果 < 0，整顆反紅
    if (budgetPercentRemaining > 100) {
      batteryFillElement.setAttribute('height', batteryMaxHeight.toString());
      batteryFillElement.setAttribute('y', '12');

      if(isPositive) {
        batteryFillElement.setAttribute('fill', '#2e7d32'); //  綠色
        batteryFillElement.setAttribute('class', 'alert-green');  //  閃綠
      }
      else{
        batteryFillElement.setAttribute('fill', '#d50000')  //  紅色
        batteryFillElement.setAttribute('class', 'alert-red') //  閃紅
      }

      // 顯示實際超支 % 數，帶上警告符號
      batteryPercentText.textContent = `${Math.round(budgetPercentRemaining)}%`;

      return; // 直接 return，後面就不跑 gradient 部分了
    }

    //  高度 + 位置計算（此處不需加 abs，已在外面加過）
    const newHeight = Math.max(0, Math.min((budgetPercentRemaining / 100) * batteryMaxHeight, batteryMaxHeight));
    const newY = 12 + (batteryMaxHeight - newHeight);

    batteryFillElement.setAttribute('height', newHeight.toString());
    batteryFillElement.setAttribute('y', newY.toString());
    // 百分比文字
    batteryPercentText.textContent = `${Math.round(budgetPercentRemaining)}%`;

    //  ⚠️清除之前的 class （避免殘留 alert-*）
    batteryFillElement.removeAttribute('class');

    // 更新漸層顏色
    const gradient = document.querySelector<SVGLinearGradientElement>('#batteryGradient');
    if (!gradient) return; // 防止找不到時報錯
    const stops = gradient.querySelectorAll('stop');

    let color1 = '#76ff03'; // default green
    let color2 = '#4caf50';

    if (isPositive) {
      if (budgetPercentRemaining == 100) {
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
      } else {
        color1 = '#f44336';
        color2 = '#e53935';

        // 保證正常狀態時不殘留 alert-red class
        batteryFillElement.removeAttribute('class');
      }
    } else {
      // 餘額為負 → 一律紅色系
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
    //非本月份儲蓄不可編輯
    if(!this.isCurrentMonthSelected()){
      console.warn('非本月不可編輯儲蓄');
      return;
    }

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

    //  組 API 傳入資料
    const data = {
      balanceId: this.selectedBalanceId,
      name: '',
      savings: this.savings
    };

    //  呼叫 updateSavings API
    this.apiService.updateSavings(data)
    .then(res => {
      console.log('儲蓄金額更新成功', res);
      this.loadBudgetData();
      //  同步更新數據
    })
    .catch(err => {
      console.log('儲蓄金額更新失敗', err);
    });
  }

  //  取消編輯儲蓄
  cancelEditBudget(){
    this.isEditingBudget = false;
  }

  //  根據 selectedType 更新 categoriesFilteredItems
  updateCategoriesFiltedItems(){
    //  先取出符合 type 的所有 item
    this.categoriesFilteredItems = this.categories
      //  篩選 如果
      //  !this.selectedType 是空值或 null 篩全部
      //  this.selectedType == '全部'也是篩全部
      .filter(c => !this.selectedType || this.selectedType == '全部' || c.type == this.selectedType)
      .map(c => c.item);

    //  加上「全部」選項在最前面
    this.categoriesFilteredItems = ['全部', ...new Set(this.categoriesFilteredItems)];

    //  預設 item 選「全部」
    this.selectedItem = '全部';
    this.currentPage = 1;
    this.applyFilters();
  }

  //  get 方法在裡面值有變動時會自動執行調整
  get filteredFullData(): PaymentIdFormData[] {
    const selected = this.rawPaymentList.find(p => p.balanceId == this.selectedBalanceId);
    if(!selected) return [];
    const today = new Date();
    let payments: (PaymentIdFormData & { isRecurring?: string })[] = selected.paymentInfoList
      .map((p: any) => {
        const r = p.recurringPeriod || { year: 0, month: 0, day: 0 };
        const isRecurring = r.year !== 0 || r.month !== 0 || r.day !== 0;
        const recordDate = new Date(p.recordDate);
        return {
          paymentId: p.paymentId,
          type: p.type,
          item: p.item,
          description: p.description,
          amount: p.amount,
          recordDate,
          recurringPeriodYear: r.year,
          recurringPeriodMonth: r.month,
          recurringPeriodDay: r.day,
          isRecurring: isRecurring ? '是' : '否'
        };
      })
      .filter((p: any) => {
        //  篩掉「循環且日期在未來」
        const isRecurring = p.isRecurring == '是';
        return !(isRecurring && p.recordDate > today);
      });
    payments = payments.filter(t =>
      (!this.selectedType || this.selectedType == '全部' || t.type === this.selectedType) &&
      (!this.selectedItem || this.selectedItem == '全部' || t.item === this.selectedItem) &&
      (!this.selectedRecordDate || this.isSameDate(t.recordDate, this.selectedRecordDate))
    );
    this.allFilteredData = payments;
    this.totalFilteredItems = payments.length;
    return payments;
  }

  get filteredTestData(): PaymentIdFormData[] {
    const startIndex = (this.currentPage -1) * this.itemsPerPage;
    return this.filteredFullData.slice(startIndex, startIndex + this.itemsPerPage);
  }

  //  更新日期選擇器篩選範圍
  updateMonthRange(): void {
    this.monthStartDate = new Date(this.year, this.month - 1, 1);
    this.monthEndDate = new Date(this.year, this.month, 0);
    this.loadSavingsFromAllPayments();
    this.loadBudgetData();  //  month 變動時撈資料
    this.loadPayments();
    this.updateTotalFilteredItems();
    this.updateDataSource();
    // 同步日期字串
    if (this.selectedRecordDate) {
      this.selectedRecordDateStr = this.selectedRecordDate.toISOString().slice(0, 10);
    } else {
      this.selectedRecordDateStr = null;
    }
  }

  //  日期選擇器篩選選擇日期
  isSameDate(d1: Date, d2: Date): boolean {
    return d1.getFullYear() == d2.getFullYear() &&
           d1.getMonth() == d2.getMonth() &&
           d1.getDate() == d2.getDate();
  }

  //  清除日期選擇器篩選表格選擇日期
  clearSelectedRecordDate(): void {
    this.selectedRecordDate = null;
    this.selectedRecordDateStr = null;
    this.currentPage = 1;
    this.applyFilters();
  }

  //  年月下拉式選單月份生成不超過目前月份
  generateMonths(): void {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; //  1~12

    //  如果選的年份是今年 -> 鎖住未來月份
    if(this.year == currentYear) {
      this.months = [];
      for(let m = 1; m <= currentMonth; m++) {
        this.months.push(m);
      }
    }
    else{
      //  如果選的年份是過去年份 -> 可以選 1~12
      this.months = [];
      for(let m = 1; m <= 12; m++) {
        this.months.push(m);
      }
    }

    //  檢查目前 month 是否還在合法範圍內
    if(this.month > this.months[this.months.length - 1]) {
      this.month = this.months[this.months.length - 1];
    }

    //  更新下方日期篩選範圍
    this.updateMonthRange();
  }

  //  下拉式選單切換年份時同步更新月份生成
  onYearChange(): void {
    this.generateMonths();
    this.loadBudgetData();  //  year 變動時撈資料
    this.loadPayments();
    this.updateTotalFilteredItems();
    this.updateDataSource();
    // 同步日期字串
    if (this.selectedRecordDate) {
      this.selectedRecordDateStr = this.selectedRecordDate.toISOString().slice(0, 10);
    } else {
      this.selectedRecordDateStr = null;
    }
  }

  //  撈 budget API
  loadBudgetData(): void {
    const data = {
      account: this.currentAccount,
      year: this.year,
      month: this.month
    };

    this.apiService.getBudgetByAccount(data)
    .then(res => {
      this.budgetList = res.data.budgetList || [];

      const found = this.budgetList.find(b => b.balanceId == this.selectedBalanceId);

      if(found) {
        this.updateBudgetDisplay(); //  更新畫面顯示
      }
      else{
        // 該月份雖有 budgetList，但沒有目前選帳戶 -> 清空畫面
        this.clearBudgetDisplay();
      }
    })
    .catch(err => {
      console.error('取得預算資料失敗：', err);
      this.budgetList = [];
      this.clearBudgetDisplay();
    });
  }

  //  更新預算和電池畫面顯示用方法
  updateBudgetDisplay(): void {
    const current = this.budgetList.find(b => b.balanceId == this.selectedBalanceId);

    if(current){
      this.budget = current.budget;
      this.fixedIncome = current.recurIncome;
      this.fixedExpenses = current.recurExpenditure;
      this.income = current.income;
      this.expenses = current.expenditure;
      this.balance = current.settlement;

      //  更新電池 -> 用 餘額 / 預算並進行預算為 0（也就是分母是 0 時的防呆）
      const budgetPercentRemaining = this.budget == 0 ? 0 : Math.abs(this.balance! / this.budget!) * 100;
      const isPositive = this.balance! >= 0;
      this.updateBattery(budgetPercentRemaining, isPositive);
    }
    else{
      //  沒有該月該帳戶資料 -> 清空畫面
      this.clearBudgetDisplay();
    }
  }

  //  清空畫面顯示方法
  clearBudgetDisplay(): void {
    this.budget = undefined;
    this.fixedIncome = undefined;
    this.fixedExpenses = undefined;
    this.income = undefined;
    this.expenses = undefined;
    this.balance = undefined;

    //  預設電池為 0%，負餘額（紅色系）
    this.updateBattery(0, false);
  }

  //  更新所選帳戶顯示
  get selectedBalanceName(): string {
    const found = this.balanceList.find(b => b.balanceId == this.selectedBalanceId);
    return found?.name ?? '未選擇';
  }

  //  取得特定月份帳號所有帳款
  loadPayments(): void {
    const data = {
      account: this.currentAccount,
      year: this.year,
      month: this.month
    };

    this.apiService.getPaymentByAccountAndMonth(data)
    .then(res => {
      this.rawPaymentList = res.data.balanceWithPaymentList || [];
      this.currentPage = 1;
      this.applyFilters();
    })
    .catch(err => {
      console.error('取得帳款資料失敗：', err);
      this.rawPaymentList = [];
      this.currentPage = 1;
      this.applyFilters();
    });
  }

  //  根據所選帳戶名稱更動下方表格欄位
  onBalanceChange(){
    this.loadSavingsFromAllPayments();
    this.updateBudgetDisplay();
    this.loadPayments();
    // 日期字串同步
    if (this.selectedRecordDate) {
      this.selectedRecordDateStr = this.selectedRecordDate.toISOString().slice(0, 10);
    } else {
      this.selectedRecordDateStr = null;
    }
  }

  //  換頁方法
  //  往前一頁
  prevPage(): void {
    if(this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  //  換頁方法
  //  往後一頁
  nextPage(): void {
    const startIndex = this.currentPage * this.itemsPerPage;
    if(startIndex < this.filteredFullData.length) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  //  是否有下一頁
  hasNextPage(): boolean {
    return this.currentPage * this.itemsPerPage < this.filteredFullData.length;
  }

  //  根據帳戶.年.月撈取 savings 資料
  loadSavingsFromAllPayments(): void {
    this.apiService.getSavingsByAccount(this.currentAccount)
    .then(res => {
      const savingsList = res.data.savingsList || [];

      const found = savingsList.find((s: any) =>
        s.balanceId == this.selectedBalanceId &&
        s.year == this.year &&
        s.month == this.month
      );

      if(found) {
        this.savings = found.amount;
        this.isSavingsSet = true; //  有設定過才顯示金額
      }
      else{
        this.savings = 0; //  預設為 0
        this.isSavingsSet = false;
      }
    })
    .catch(err => {
      console.error('取得儲蓄資料失敗：', err);
      this.savings = 0;
      this.isSavingsSet = false;
    });
  }

  isCurrentMonthSelected(): boolean {
    const today = new Date();
    return this.year == today.getFullYear() && this.month == today.getMonth() +1;
  }

  updateTotalFilteredItems(): void {
    this.totalFilteredItems = this.filteredFullData.length;
  }

  updateDataSource(): void {
    this.dataSource.data = this.filteredTestData;
  }

  // 分頁事件處理
  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.applyFilters();
  }

  onRecordDateChange(): void {
    if (this.selectedRecordDateStr) {
      this.selectedRecordDate = new Date(this.selectedRecordDateStr);
    } else {
      this.selectedRecordDate = null;
    }
    this.currentPage = 1;
    this.applyFilters();
  }

  onItemChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  // 每頁筆數變更事件處理
  onPageSizeChange(newPageSize: number): void {
    this.itemsPerPage = newPageSize;
    this.currentPage = 1;// 重置到第一頁
    this.applyFilters();
    setTimeout(() => {
      this.scrollToTableTop();
    }, 100);
  }

  // 滾動到表格頂部
  scrollToTableTop(): void {
    if (this.tableContainer && this.tableContainer.nativeElement) {
      this.tableContainer.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  /**
   * 先過濾、再排序、再分頁
   * allFilteredData：所有過濾後的完整資料（未分頁）
   * dataSource.data：當前分頁要顯示的資料
   */
  applyFilters(): void {
    // 取得目前選擇的帳戶資料
    const selected = this.rawPaymentList.find(p => p.balanceId == this.selectedBalanceId);
    // 修正：若 selectedRecordDateStr 有值，轉成 Date
    if (this.selectedRecordDateStr) {
      this.selectedRecordDate = new Date(this.selectedRecordDateStr);
    } else {
      this.selectedRecordDate = null;
    }
    if (!selected) {
      this.dataSource.data = [];
      this.allFilteredData = [];
      this.totalFilteredItems = 0;
      return;
    }
    const today = new Date();
    // 這裡 map/filter 流程等同原本 filteredFullData 的註解
    // 1. 先將 paymentInfoList 轉成 PaymentIdFormData 陣列
    // 2. 過濾掉「循環且日期在未來」的資料
    // 3. 再依 type/item/日期做篩選
    let payments: (PaymentIdFormData & { isRecurring?: string })[] = selected.paymentInfoList
      .map((p: any) => {
        const r = p.recurringPeriod || { year: 0, month: 0, day: 0 };
        const isRecurring = r.year !== 0 || r.month !== 0 || r.day !== 0;
        const recordDate = new Date(p.recordDate);
        return {
          paymentId: p.paymentId,
          type: p.type,
          item: p.item,
          description: p.description,
          amount: p.amount,
          recordDate,
          recurringPeriodYear: r.year,
          recurringPeriodMonth: r.month,
          recurringPeriodDay: r.day,
          isRecurring: isRecurring ? '是' : '否'
        };
      })
      .filter((p: any) => {
        //  篩掉「循環且日期在未來」
        const isRecurring = p.isRecurring == '是';
        return !(isRecurring && p.recordDate > today);
      });
    // 依 type/item/日期做篩選（和原本 filteredFullData 註解一致）
    payments = payments.filter(t =>
      (!this.selectedType || this.selectedType == '全部' || t.type === this.selectedType) &&
      (!this.selectedItem || this.selectedItem == '全部' || t.item === this.selectedItem) &&
      (!this.selectedRecordDate || this.isSameDate(t.recordDate, this.selectedRecordDate))
    );
    // allFilteredData：所有過濾後的完整資料（未分頁）
    this.allFilteredData = payments;
    this.totalFilteredItems = payments.length;
    // 如果有排序，這裡會針對全部資料排序
    if (this.sort && this.sort.active) {
      this.allFilteredData = this.dataSource.sortData([...this.allFilteredData], this.sort);
    }
    // 分頁（等同原本 filteredTestData 的 slice 註解）
    // dataSource.data：當前分頁要顯示的資料
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.dataSource.data = this.allFilteredData.slice(startIndex, endIndex);
  }

  // 判斷該筆是否為收入
  isIncome(row: any): boolean {
    return row.type === '收入';
  }
}
