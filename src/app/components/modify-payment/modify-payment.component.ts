import { PaymentModifiedService } from './../../@services/payment-modified.service';
import { ApiService } from './../../@services/api.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Balance } from '../../models/Balance';
import { Category } from '../../models/categories';
import { PaymentIdFormData } from '../../models/paymentIdFormData';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-modify-payment',
  templateUrl: './modify-payment.component.html',
  styleUrls: ['./modify-payment.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatCardModule,
  ],
})
export class ModifyPaymentComponent implements OnInit, AfterViewInit{

  constructor(
    private apiService: ApiService,
    private router: Router,
    private paymentModifiedService: PaymentModifiedService
  ){}

  balanceList: Balance[] = []; //  透過帳號取得帳戶給下拉式選單用
  year: number = new Date().getFullYear(); //  預設帳戶時間（年）
  month: number = new Date().getMonth() + 1;  //  預設帳戶時間（月）
  years: number[] = []; //  年份列表
  months: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; //  月份列表
  monthStartDate: Date = new Date(this.year, this.month-1, 1);  //  日期選擇器篩選表格開始日期
  monthEndDate: Date = new Date(this.year, this.month, 0);  //  日期選擇器篩選表格結束日期
  account: string = "a6221339"; //  預設帳號
  rawPaymentList: any[] = []; //  原始 API 回傳的 balanceWithPaymentList
  selectedBalanceId?: number = 0; //  使用者選擇的 balanceId
  categories: Category[] = [];
  distinctTypes: string[] = []; //  不重複的類型
  selectedType?: string | null;  //  下拉式選單(type)
  selectedItem?: string | null;  //  下拉式選單(item)
  categoriesFilteredItems: string[] = []; //  兩層下拉式選單第二層的對象
  selectedRecordDate?: Date | null; //  目前選擇的紀錄日期
  allSelected: boolean = false;
  filteredTestData: (PaymentIdFormData & { selected?: boolean })[] = [];
  sortField: 'amount' | 'recordDate' | '' = ''; //  排序欄位
  sortDirection: 'asc' | 'desc' = 'asc';  //  排序方向
  currentPage: number = 1;  //  當前頁
  itemsPerPage: number = 10;  //  每頁筆數
  dataSource = new MatTableDataSource<PaymentIdFormData & { selected?: boolean }>([]);
  selection = new SelectionModel<PaymentIdFormData & { selected?: boolean }>(true, []);
  displayedColumns: string[] = [
    'select',
    'type',
    'item',
    'description',
    'amount',
    'recurringPeriodYear',
    'recurringPeriodMonth',
    'recurringPeriodDay',
    'recordDate'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    //  初始化年份選單列表
    this.generateYears();
    this.generateMonths();
    this.updateMonthRange();

    //  取得 balanceList ，因下拉式選單要用
    this.apiService.getBalanceByAccount(this.account)
    .then(res => {
      this.balanceList = res.data.balanceList || [];

      //  若有帳戶，預設選第一筆
      if(this.balanceList.length > 0){
        this.selectedBalanceId = this.balanceList[0].balanceId;
      }

      //  在撈分類資料
      return this.apiService.getTypeByAccount(this.account);
    })
    .then(res => {
      const list: Category[] = res.data.paymentTypeList || [];
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

      this.loadPayments();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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

  //  更新日期選擇器篩選範圍
  updateMonthRange(): void {
    this.monthStartDate = new Date(this.year, this.month - 1, 1);
    this.monthEndDate = new Date(this.year, this.month, 0);

    this.loadPayments();
  }

  //  取得特定月份帳號所有帳款
  loadPayments(): void {
    const data = {
      account: this.account,
      year: this.year,
      month: this.month
    };

    this.apiService.getPaymentByAccountAndMonth(data)
    .then(res => {
      this.rawPaymentList = res.data.balanceWithPaymentList || [];
      this.applyFilters();
    })
    .catch(err => {
      console.error('取得帳款資料失敗：', err);
      this.rawPaymentList = [];
      this.filteredTestData = [];
    });
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

    this.applyFilters();
  }

  //  日期選擇器篩選選擇日期
  isSameDate(d1: Date, d2: Date): boolean {
    return d1.getFullYear() == d2.getFullYear() &&
           d1.getMonth() == d2.getMonth() &&
           d1.getDate() == d2.getDate();
  }

  //  根據所選帳戶名稱更動下方表格欄位
  onBalanceChange(){
    this.loadPayments();
    this.applyFilters();
  }

  //  更新所選帳戶顯示
  get selectedBalanceName(): string {
    const found = this.balanceList.find(b => b.balanceId == this.selectedBalanceId);
    return found?.name ?? '未選擇';
  }

  //  下拉式選單切換年份時同步更新月份生成
  onYearChange(): void {
    this.generateMonths();
    this.loadPayments();
    this.applyFilters();
  }

  //  清除日期選擇器篩選表格選擇日期
  clearSelectedRecordDate(): void {
    this.selectedRecordDate = null;
    this.applyFilters();
  }

  //  全選/取消全選
  toggleAll(): void {
    this.filteredTestData.forEach((item: any) => item.selected = this.allSelected);
  }

  //  同步全選
  onItemCheckChange(): void {
    this.allSelected = this.filteredTestData.length > 0 && this.filteredTestData.every(item => item.selected);
  }

  //  點擊刪除按鈕
  deleteSelectedPayments(): void {
    const selectedItems = this.selection.selected;

    if(selectedItems.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: '請先選擇要刪除的項目',
        confirmButtonText: '確定'
      });
      return;
    }

    Swal.fire({
      title: `請確定要刪除 ${selectedItems.length} 筆帳款資料？`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '是的，刪除！',
      cancelButtonText: '取消'
    }).then((result) => {
      if(result.isConfirmed){
        //  執行刪除
        Promise.all(
          selectedItems.map(item =>
            this.apiService.deletePayment(item.paymentId)
          )
        )
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: '刪除成功',
            confirmButtonText: '確定'
          });
          this.loadPayments();  //  重新載入資料
          this.selection.clear(); // 清除選取
        })
        .catch(err => {
          console.error('刪除失敗', err);
          Swal.fire({
            icon: 'error',
            title: '刪除失敗',
            text: '請稍後再試',
            confirmButtonText: '確定'
          });
        });
      }
    });
  }

  //  更新全選狀態
  updateAllSelectedState(): void {
    this.allSelected = this.filteredTestData.length > 0 && this.filteredTestData.every(item => item.selected);
  }

  //  抽方法，公用篩選韓式：根據用戶資料 + 篩選條件 更新表格資料
  applyFilters(): void {
    const selected = this.rawPaymentList.find(p => p.balanceId == this.selectedBalanceId);

    if(!selected){
      this.dataSource.data = [];
      return;
    }

    let payments: (PaymentIdFormData & { selected?: boolean })[] = selected.paymentInfoList.map((p: any) => ({
      paymentId: p.paymentId,
      type: p.type,
      item: p.item,
      description: p.description,
      amount: p.amount,
      recurringPeriodYear: p.recurringPeriod.year,
      recurringPeriodMonth: p.recurringPeriod.month,
      recurringPeriodDay: p.recurringPeriod.day,
      recordDate: new Date(p.recordDate),
      selected: false
    }));

    //  篩選
    payments = payments.filter(t =>
      (!this.selectedType || this.selectedType == '全部' || t.type?.includes(this.selectedType!)) &&
      (!this.selectedItem || this.selectedItem == '全部' || t.item?.includes(this.selectedItem!)) &&
      (!this.selectedRecordDate || this.isSameDate(t.recordDate, this.selectedRecordDate))
    );

    //  交給 Material Table 處理排序/分頁
    this.dataSource.data = payments;
    this.updateAllSelectedState();
  }

  goEditPayment(){
    const selectedItems = this.selection.selected;

    if(selectedItems.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: '請先選擇要編輯的帳款',
        confirmButtonText: '確定'
      });
      return;
    }

    if(selectedItems.length > 1) {
      Swal.fire({
        icon: 'warning',
        title: '一次只能編輯一筆帳款，請重新選擇',
        confirmButtonText: '確定'
      });
      return;
    }

    const selectedPaymentId = selectedItems[0].paymentId;
    const selectedItem = selectedItems[0];
    this.paymentModifiedService.setPaymentFormData(selectedItem); //  傳資料
    console.log(selectedItem);
    this.router.navigate(['/editPayment'], {
      queryParams: { paymentId: selectedPaymentId }
    });
  }

  toggleSort(field: 'amount' | 'recordDate'): void {
    if(this.sortField == field) {
      this.sortDirection = this.sortDirection == 'asc' ? 'desc' : 'asc';
    }
    else{
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters();  //  重新應用排序與分頁
  }

  PrevPage(): void {
    if(this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  nextPage(): void {
    this.currentPage++;
    this.applyFilters();
  }

  hasNectPage(): boolean {
    const selected = this.rawPaymentList.find(p => p.balanceId == this.selectedBalanceId);
    if(!selected) return false;

    let payments = selected.paymentInfoList.filter((t: any) =>
      (!this.selectedType || this.selectedType == '全部' || t.type?.includes(this.selectedType!)) &&
      (!this.selectedItem || this.selectedItem == '全部' || t.item?.includes(this.selectedItem!)) &&
      (!this.selectedRecordDate || this.isSameDate(new Date(t.recordDate), this.selectedRecordDate))
    );

    return this.currentPage * this.itemsPerPage < payments.length;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows && numRows > 0;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  toggleSelection(row: any) {
    this.selection.toggle(row);
  }

  // 清除帳戶/年月篩選
  clearAccountYearMonthFilters(): void {
    // 預設選第一個帳戶
    if (this.balanceList.length > 0) {
      this.selectedBalanceId = this.balanceList[0].balanceId;
    } else {
      this.selectedBalanceId = 0;
    }
    this.year = new Date().getFullYear();
    this.month = new Date().getMonth() + 1;
    this.generateMonths();
    this.applyFilters();
  }

  // 清除分類篩選
  clearCategoryFilters(): void {
    this.selectedType = '全部';
    this.updateCategoriesFiltedItems();
    this.selectedItem = '全部';
    this.applyFilters();
  }

}
