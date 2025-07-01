import { AuthService } from './../../@services/auth.service';
import { PaymentModifiedService } from './../../@services/payment-modified.service';
import { ApiService } from './../../@services/api.service';
import { CommonModule} from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Balance } from '../../models/balance';
import { Category } from '../../models/categories';
import { PaymentIdFormData } from '../../models/paymentIdFormData';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomPaginatorComponent } from '../custom-paginator/custom-paginator.component';

@Component({
  selector: 'app-modify-payment',
  templateUrl: './modify-payment.component.html',
  styleUrls: ['./modify-payment.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatButtonModule,
    MatCardModule,
    CustomPaginatorComponent,
  ],
  providers: [
    provideNativeDateAdapter(),
  ]
})
export class ModifyPaymentComponent implements OnInit, AfterViewInit{

  constructor(
    private apiService: ApiService,
    private router: Router,
    private paymentModifiedService: PaymentModifiedService,
    private authService: AuthService
  ){}

  balanceList: Balance[] = []; //  透過帳號取得帳戶給下拉式選單用
  year: number = new Date().getFullYear(); //  預設帳戶時間（年）
  month: number = new Date().getMonth() + 1;  //  預設帳戶時間（月）
  years: number[] = []; //  年份列表
  months: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; //  月份列表
  monthStartDate: Date = new Date(this.year, this.month-1, 1);  //  日期選擇器篩選表格開始日期
  monthEndDate: Date = new Date(this.year, this.month, 0);  //  日期選擇器篩選表格結束日期
  account: string = ''; //  預設帳號
  rawPaymentList: any[] = []; //  原始 API 回傳的 balanceWithPaymentList
  selectedBalanceId?: number = 0; //  使用者選擇的 balanceId
  categories: Category[] = [];
  distinctTypes: string[] = []; //  不重複的類型
  selectedType?: string | null;  //  下拉式選單(type)
  selectedItem?: string | null;  //  下拉式選單(item)
  categoriesFilteredItems: string[] = []; //  兩層下拉式選單第二層的對象
  selectedRecordDate?: Date | null; //  目前選擇的紀錄日期
  selectedRecordDateStr: string | null = null;
  allSelected: boolean = false;

  // 分頁相關
  currentPage: number = 1;  //  當前頁
  itemsPerPage: number = 5;  //  每頁筆數
  totalFilteredItems: number = 0; // 篩選後的總筆數
  allFilteredData: (PaymentIdFormData & { selected?: boolean })[] = []; // 所有篩選後的資料

  dataSource = new MatTableDataSource<PaymentIdFormData & { selected?: boolean }>([]);
  selection = new SelectionModel<PaymentIdFormData & { selected?: boolean }>(true, []);
  displayedColumns: string[] = [
    'select',
    'type',
    'item',
    'description',
    'amount',
    'isRecurring',
    'recordDate'
  ];

  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {

    //  從 AuthService 取得登入會員帳號
    const user = this.authService.getCurrentUser();
    if(!user) {
      Swal.fire('錯誤', '尚未登入，請重新登入', 'error');
      this.router.navigate(['/login']);
      return;
    }
    this.account = user.account;

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
    this.dataSource.sort = this.sort;

    // 監聽排序變更，重新分頁
    this.dataSource.sort?.sortChange.subscribe(() => {
      // 重新排序所有篩選後的資料
      this.allFilteredData = this.dataSource.sortData([...this.allFilteredData], this.sort);
      // 重置到第一頁並更新分頁資料
      this.currentPage = 1;
      this.updatePagedData();
    });
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
    // 同步日期字串
    if (this.selectedRecordDate) {
      this.selectedRecordDateStr = this.selectedRecordDate.toISOString().slice(0, 10);
    } else {
      this.selectedRecordDateStr = null;
    }
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
      this.allFilteredData = [];
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
    // 同步日期字串
    if (this.selectedRecordDate) {
      this.selectedRecordDateStr = this.selectedRecordDate.toISOString().slice(0, 10);
    } else {
      this.selectedRecordDateStr = null;
    }
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
    // 同步日期字串
    if (this.selectedRecordDate) {
      this.selectedRecordDateStr = this.selectedRecordDate.toISOString().slice(0, 10);
    } else {
      this.selectedRecordDateStr = null;
    }
  }

  //  清除日期選擇器篩選表格選擇日期
  clearSelectedRecordDate(): void {
    this.selectedRecordDate = null;
    this.selectedRecordDateStr = null;
    this.applyFilters();
  }

  //  全選/取消全選
  toggleAll(): void {
    this.allFilteredData.forEach((item: any) => item.selected = this.allSelected);
  }

  //  同步全選
  onItemCheckChange(): void {
    this.allSelected = this.allFilteredData.length > 0 && this.allFilteredData.every(item => item.selected);
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
    this.allSelected = this.allFilteredData.length > 0 && this.allFilteredData.every(item => item.selected);
  }

  //  抽方法，公用篩選韓式：根據用戶資料 + 篩選條件 更新表格資料
  applyFilters(): void {
    const selected = this.rawPaymentList.find(p => p.balanceId == this.selectedBalanceId);

    // 修正：若 selectedRecordDateStr 有值，轉成 Date
    if (this.selectedRecordDateStr) {
      this.selectedRecordDate = new Date(this.selectedRecordDateStr);
    } else {
      this.selectedRecordDate = null;
    }

    if(!selected){
      this.dataSource.data = [];
      this.allFilteredData = [];
      this.totalFilteredItems = 0;
      return;
    }

    const today = new Date();

    let payments: (PaymentIdFormData & { selected?: boolean, isRecurring: string })[] = selected.paymentInfoList
    .map((p: any) => {
      const r = p.recurringPeriod;
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
        isRecurring: isRecurring ? '是' : '否',
        selected: false
      };
    })
    .filter((p: any) => {
      //  篩掉「循環且日期在未來」
      const isRecurring = p.isRecurring == '是';
      return !(isRecurring && p.recordDate > today);
    });

    //  篩選（type/item 用 ===）
    payments = payments.filter(t =>
      (!this.selectedType || this.selectedType == '全部' || t.type === this.selectedType) &&
      (!this.selectedItem || this.selectedItem == '全部' || t.item === this.selectedItem) &&
      (!this.selectedRecordDate || this.isSameDate(t.recordDate, this.selectedRecordDate))
    );

    // 儲存所有篩選後的資料
    this.allFilteredData = payments;
    this.totalFilteredItems = payments.length;

    // 如果有排序設定，應用排序
    if (this.sort && this.sort.active) {
      this.allFilteredData = this.dataSource.sortData([...this.allFilteredData], this.sort);
    }

    // 重置到第一頁
    this.currentPage = 1;

    // 實作分頁邏輯
    this.updatePagedData();
  }

  // 更新分頁資料
  updatePagedData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    // 取得當前頁的資料
    const pagedData = this.allFilteredData.slice(startIndex, endIndex);

    // 更新表格資料源
    this.dataSource.data = pagedData;

    // 清除選取狀態
    this.selection.clear();

    this.updateAllSelectedState();
  }

  // 分頁事件處理
  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.updatePagedData();
  }

  // 每頁筆數變更事件處理
  onPageSizeChange(newPageSize: number): void {
    this.itemsPerPage = newPageSize;
    this.currentPage = 1; // 重置到第一頁
    this.updatePagedData();
  }

  //  前往編輯款項
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

  //  是否全選
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows && numRows > 0;
  }

  //  全選 / 取消全選
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  //  勾選單一列
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
