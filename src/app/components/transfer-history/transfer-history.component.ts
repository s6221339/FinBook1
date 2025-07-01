import { AuthService } from './../../@services/auth.service';
import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../@services/api.service';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Transfer, Account } from '../../models/transfers';
import Swal from 'sweetalert2';
import { CustomPaginatorComponent } from '../custom-paginator/custom-paginator.component';

@Component({
  selector: 'app-transfer-history', // 元件的選擇器名稱，用於在 HTML 模板中使用 <app-transfer-history>
  // imports 陣列中列出了此元件所需的 Angular 模組，使得它們提供的指令、管道、元件等可用於此元件的模板
  imports: [
    CommonModule, // 提供 *ngIf, *ngFor 等常見指令
    RouterModule,
    FormsModule, // 提供 ngModel 等表單相關功能
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    ReactiveFormsModule,
    CustomPaginatorComponent, // 補充：自訂分頁器
  ],
  templateUrl: './transfer-history.component.html',
  styleUrl: './transfer-history.component.scss'
})

export class TransferHistoryComponent implements OnInit {

  // 構造函數 (Constructor)：用於注入服務
  // private api: ApiService：用於與後端 API 進行交互
  // private paginatorIntl: MatPaginatorIntl：用於自定義 Material 分頁器的文字
  // private route: ActivatedRoute：用於獲取查詢參數
  // private router: Router：用於更新查詢參數
  constructor(
    private api: ApiService,
    private paginatorIntl: MatPaginatorIntl,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  // =====================================
  // 屬性宣告 (Properties)
  // =====================================

  // 定義 Material Table 要顯示的欄位標識符陣列，這些名稱應與 Transfer 介面中的屬性名稱一致
  public displayedColumns: string[] = ['rowIndex', 'createDate', 'fromBalanceId', 'toBalanceId', 'amount', 'description'];

  // 表格的數據源，泛型 <Transfer> 表示數據的類型是 Transfer 介面。初始時設定為空陣列
  public dataSource = new MatTableDataSource<Transfer>([]);

  // 當前表格顯示的總筆數 (會隨著篩選條件變化)
  public totalItems = 0;

  // 每頁顯示的數據筆數
  public pageSize = 5;

  // 記錄最後一筆交易的日期字串，用於顯示在統計摘要中
  public lastTransactionDate: string = '';

  // 日期篩選的起始日期 (由使用者輸入的 ngModel 綁定)
  public startDate: string = '';

  // 日期篩選的結束日期 (由使用者輸入的 ngModel 綁定)
  public endDate: string = '';

  // 獲取今天的日期，並格式化為 'YYYY-MM-DD' 字串，用於設定日期選擇器的最大值，防止選擇未來日期
  public today: string = new Date().toISOString().split('T')[0];

  // _allTransferRecords：私有變數，用於儲存從後端獲取的所有原始轉帳紀錄 (針對單一選定的帳戶)。
  // 這是數據的「單一來源」，所有篩選操作都在這個數據副本上進行。
  private _allTransferRecords: Transfer[] = [];

  // 儲存目前選擇查看的帳戶 ID。如果為 null，表示尚未選定任何帳戶或沒有可選帳戶。
  public currentBalanceId: number | null = null;

  // 私有 Map 數據結構，用於儲存帳戶 ID 到帳戶名稱的映射。
  // 提供高效的查找功能，用於將轉帳紀錄中的 fromBalanceId/toBalanceId 轉換為可讀的帳戶名稱。
  private accountNameMap: Map<number, string> = new Map();

  // 用於儲存從後端獲取的所有帳戶列表，供下拉選單 (mat-select) 使用。
  public accounts: Account[] = [];

  // FormControl 實例，用於響應式地控制和監聽帳戶選擇下拉選單的值。
  // 初始值為 null，表示預設沒有選中任何帳戶。
  public selectedAccountId = new FormControl<number | null>(null);

  // 使用 @ViewChild 裝飾器獲取模板中 MatPaginator 元件的實例。
  // `!` 是非空斷言操作符，表示該屬性會在元件初始化時被 Angular 賦值，不會為 null。
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // 使用 @ViewChild 裝飾器獲取模板中 MatSort 元件的實例。
  @ViewChild(MatSort) sort!: MatSort;

  @ViewChild('tableContainer') tableContainer!: ElementRef<HTMLElement>;

  /**
   * 補充：自訂分頁器 currentPage/itemsPerPage 與事件
   */
  public currentPage: number = 1;
  public itemsPerPage: number = 5;

  // =====================================
  // 生命週期鉤子 (Lifecycle Hooks)
  // =====================================
 ngOnInit(): void {
    // 設定 Material 分頁器的國際化文字，讓其顯示為中文
    this.paginatorIntl.itemsPerPageLabel = '每頁筆數：';
    this.paginatorIntl.nextPageLabel = '下一頁';
    this.paginatorIntl.previousPageLabel = '上一頁';
    this.paginatorIntl.firstPageLabel = '第一頁';
    this.paginatorIntl.lastPageLabel = '最後一頁';

    // 處理查詢參數
    this.route.queryParams.subscribe(params => {
      const accountId = params['id'] ? Number(params['id']) : null;
      console.log('從查詢參數獲取到的帳戶ID:', accountId);

      this.loadAccountNames()
        .then(() => {
          console.log("帳戶名稱及列表已成功載入。");

          if (this.accounts.length > 0) {
            let targetAccountId: number;

            // 如果有查詢參數且該帳戶存在，則使用查詢參數的帳戶ID
            if (accountId && this.accounts.find(acc => acc.balanceId === accountId)) {
              targetAccountId = accountId;
              console.log(`使用查詢參數指定的帳戶: ${targetAccountId}`);
            } else {
              // 否則使用第一個帳戶作為預設
              targetAccountId = this.accounts[0].balanceId;
              console.log(`使用預設帳戶: ${targetAccountId}`);
            }

            // 步驟 1: 先默默地(不觸發事件)設定表單控制項的值，
            // 這樣做的目的是讓下拉選單的 UI 正確顯示預設選項。
            this.selectedAccountId.setValue(targetAccountId, { emitEvent: false });
            this.currentBalanceId = targetAccountId;

            // 步驟 2: 然後直接、明確地呼叫處理函式來載入資料。
            // onAccountSelectionChange 會處理後續的 SweetAlert 提示和資料載入。
            this.onAccountSelectionChange(targetAccountId);
          } else {
            // ... (沒有帳戶的處理邏輯不變)
            this.currentBalanceId = null;
            this.dataSource.data = [];
            this.totalItems = 0;
            this._allTransferRecords = [];
            this.lastTransactionDate = '';
            console.warn('該用戶沒有任何帳戶可供查詢。');
            Swal.fire('提示', '您沒有任何可查詢的帳戶。', 'info');
          }
        })
        .catch(error => {
          // ... (catch 區塊不變)
          console.error('初始化失敗：載入帳戶名稱時出錯！', error);
          Swal.fire('錯誤', '載入資料時發生錯誤，請稍後再試。', 'error');
          this.currentBalanceId = null;
          this.dataSource.data = [];
          this.totalItems = 0;
          this._allTransferRecords = [];
          this.lastTransactionDate = '';
        });
    });
}

  ngAfterViewInit(): void {
    // 確保 paginator 和 sort 實例已經可用，並將它們綁定到 dataSource
  if (this.paginator) {
    this.dataSource.paginator = this.paginator;
  }
  if (this.sort) {
    this.dataSource.sort = this.sort;
  }
  this.dataSource.sort?.sortChange.subscribe(() => {
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  });
  }

  // =====================================
  // 私有方法 (Private Methods)
  // =====================================

  /**
   * 私有方法：負責從後端載入所有帳戶的名稱並建立映射表。
   * 此方法同時會填充 `this.accounts` 陣列，供下拉選單使用。
   * @returns Promise<void> - 返回一個 Promise，表示非同步操作完成。
   */
  private loadAccountNames(): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    const testAccount = currentUser?.account || '';

    // 檢查用戶帳號是否有效，如果為空則直接拒絕 Promise，防止無效請求
    if (!testAccount) {
      console.error('無法載入帳戶名稱：缺少用戶帳戶信息。');
      return Promise.reject('缺少用戶帳戶信息');
    }

    // 呼叫 ApiService 的 getBalanceByAccount 方法來獲取帳戶列表
    return this.api.getBalanceByAccount(testAccount)
      .then(resp => {
        // 檢查 API 回應的數據結構是否符合預期（必須有 data 且 data.balanceList 是陣列）
        if (resp.data && Array.isArray(resp.data.balanceList) && resp.data.balanceList.length > 0) {
          this.accountNameMap.clear(); // 在填充前，先清空舊的映射表，防止重複數據
          this.accounts = []; // 清空現有的帳戶列表，準備填充新數據

          // 遍歷後端返回的每個帳戶物件
          resp.data.balanceList.forEach((account: Account) => {
            // 將每個帳戶的 balanceId 作為 key，name 作為 value 存入 accountNameMap，用於快速查找名稱
            this.accountNameMap.set(account.balanceId, account.name);
            // 將每個帳戶物件添加到 accounts 陣列中，供下拉選單顯示
            this.accounts.push(account);
          });
          console.log('帳戶名稱映射已成功載入:', this.accountNameMap);
          console.log('用於下拉選單的帳戶列表已載入:', this.accounts);
        } else {
          // 如果數據結構不符或沒有帳戶資料，發出警告並清空 accounts 列表
          this.accounts = []; // 確保 accounts 列表為空，即使 resp.data.balanceList 為空或格式不對
          this.accountNameMap.clear(); // 清空映射
          console.warn('API 回應的帳戶資料結構不符合預期或沒有任何帳戶。', resp);
        }
      })
      .catch(error => {
        // 如果 API 呼叫失敗，則在控制台記錄錯誤並重新拋出錯誤，以便上層的 .catch 也能處理
        this.accounts = []; // 確保發生錯誤時 accounts 列表為空
        this.accountNameMap.clear(); // 清空映射
        console.error('獲取帳戶名稱失敗！', error);
        return Promise.reject(error); // 繼續拋出錯誤給 ngOnInit 的 catch 處理
      });
  }

  /**
   * 私有方法：從後端載入指定 `balanceId` 的所有轉帳資料。
   * 此方法假設 `balanceId` 是一個有效的帳戶 ID。
   * @param balanceId 帳戶的數字 ID
   * @returns Promise<void> - 返回一個 Promise，表示非同步操作完成。
   */
  private loadTransfersByBalanceId(balanceId: number): Promise<void> {
    console.log(`正在獲取帳戶 ID: ${balanceId} 的轉帳紀錄...`);
    // !! 修正點 1: 將 getTransfersByBalanceId 更正為 getAllTransfersByBalanceId
    return this.api.getAllTransfersByBalanceId(balanceId)
      .then(resp => {
        let data: Transfer[] = []; // 初始化一個空陣列來存放解析後的轉帳數據

        // 檢查 API 回應的數據結構，確保有 `data` 且 `data.transfers` 是陣列
        if (resp.data && resp.data.transfersList && Array.isArray(resp.data.transfersList)) {
          data = resp.data.transfersList; // 將數據類型斷言為 Transfer 陣列
          console.log(`帳戶 ${balanceId} 共載入 ${data.length} 筆原始記錄。`);
        } else {
          // 如果數據結構不符或無轉帳資料，則發出警告
          console.warn('API 回應的資料結構不符合預期或無轉帳資料', resp);
        }

        this._allTransferRecords = data; // 將獲取到的轉帳紀錄儲存到私有變數 `_allTransferRecords`
        this.applyDateFilter(); // 數據載入後，立即應用日期篩選（即使沒有篩選條件也會全部顯示）

        // 更新最後一筆交易的日期
        // 為了確保獲取到最新日期，先對原始數據進行日期降序排序
        if (this._allTransferRecords.length > 0) {
          const sortedByDate = [...this._allTransferRecords].sort((a, b) => {
            return new Date(b.createDate).getTime() - new Date(a.createDate).getTime();
          });
          this.lastTransactionDate = sortedByDate[0].createDate;
        } else {
          this.lastTransactionDate = ''; // 如果沒有數據，則清空日期
        }
      })
      .catch(error => {
        // 如果 API 呼叫失敗，在控制台記錄錯誤並重新拋出，讓 `onAccountSelectionChange` 的 `.catch` 處理統一的錯誤提示
        console.error(`載入帳戶 ${balanceId} 轉帳資料失敗！`, error);
        this._allTransferRecords = []; // 載入失敗時清空數據
        this.applyDateFilter(); // 更新表格顯示為空
        this.lastTransactionDate = ''; // 清空最後交易日期
        return Promise.reject(error); // 繼續拋出錯誤，確保錯誤被 Promise 鏈中的下一個 catch 捕獲
      });
  }

  // =====================================
  // 公有方法 (Public Methods)
  // =====================================

  /**
   * 當帳戶選擇下拉選單的值發生變化時觸發的方法。
   * 可同時支援 HTML select 事件（$event）或直接傳入帳戶 ID。
   *
   * @param eventOrValue - 可能是帳戶 ID (number/null)，或 select change 事件 (Event)。
   *   - 若為 number/null，直接指定帳戶 ID。
   *   - 若為 Event，會自動解析 value 並轉成 number。
   * @returns Promise<void> - 異步操作完成的 Promise。
   */
  public onAccountSelectionChange(eventOrValue: Event | number | null): Promise<void> {
    let value: number | null = null;
    if (typeof eventOrValue === 'number' || eventOrValue === null) {
      value = eventOrValue;
    } else if (eventOrValue && eventOrValue.target) {
      const v = (eventOrValue.target as HTMLSelectElement).value;
      value = v ? Number(v) : null;
    }
    // 修正：value 若為字串則轉成 number
    if (typeof value === 'string') {
      value = Number(value);
    }
    this.currentBalanceId = value;
    if (typeof this.selectedAccountId.setValue === 'function') {
      this.selectedAccountId.setValue(value, { emitEvent: false });
    }

    // 更新 URL 查詢參數
    this.updateQueryParams(value);

    if (value === null) {
      this.dataSource.data = [];
      this.totalItems = 0;
      this._allTransferRecords = [];
      this.lastTransactionDate = '';
      console.log('已清除帳戶選擇，表格數據已清空。');
      return Promise.resolve();
    }
    return this.loadTransfersByBalanceId(value)
      .then(() => {
        console.log('指定帳戶轉帳資料載入完成。');
      })
      .catch(error => {
        console.error('更新轉帳資料失敗！', error);
        Swal.fire('錯誤', '載入轉帳資料失敗，請稍後再試。', 'error');
      });
  }

  /**
   * 更新 URL 查詢參數
   * @param accountId 帳戶ID，如果為 null 則清除查詢參數
   */
  private updateQueryParams(accountId: number | null): void {
    if (accountId) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { id: accountId },
        queryParamsHandling: 'merge'
      });
    } else {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        queryParamsHandling: ''
      });
    }
  }

  /**
   * 用於在 HTML 模板中，根據帳戶 ID 或 FormControl 取得其對應的帳戶名稱。
   *
   * @param balanceIdOrControl - 可以是帳戶 ID (number)、FormControl 或 null。
   *   - 若為 number，直接查詢帳戶名稱。
   *   - 若為 FormControl，會自動取其 value。
   *   - 若為 null，回傳空字串。
   * @returns string - 返回格式化後的帳戶名稱或 ID 字符串。
   */
  public getAccountName(balanceIdOrControl: number | { value: number | null } | null): string {
    let id: number | null = null;
    if (typeof balanceIdOrControl === 'number') {
      id = balanceIdOrControl;
    } else if (balanceIdOrControl && typeof balanceIdOrControl === 'object' && 'value' in balanceIdOrControl) {
      id = balanceIdOrControl.value;
    }
    // 修正：如果 id 是字串，轉成數字
    if (typeof id === 'string') {
      id = Number(id);
    }
    if (id == null) return '';
    const accountName = this.accountNameMap.get(id);
    return accountName ? `${accountName} (ID: ${id})` : `ID: ${id}`;
  }

  /**
   * 當日期篩選器（開始日期或結束日期）的值發生變化時觸發的方法。
   * 為了避免輸入框每次按鍵都觸發篩選，這裡使用了 setTimeout 進行延遲執行，優化性能。
   */
  public onDateRangeChange(): void {
    setTimeout(() => {
      this.applyDateFilter();
    }, 300); // 延遲 300 毫秒執行篩選
  }

  /**
   * 純前端的日期區間篩選方法。
   * 此方法根據 `startDate` 和 `endDate` 篩選 `_allTransferRecords` 中的數據，
   * 並更新 `dataSource` 和表格顯示。它只對已經載入到前端的數據進行操作。
   */
  private applyDateFilter(): void {
    // 創建原始數據 `_allTransferRecords` 的副本，避免直接修改原始數據，確保篩選可逆
    let filteredData = [...this._allTransferRecords];

    // 解析篩選的開始日期，並將時間部分設定為當天 00:00:00.000，確保比較精確到天
    const start = this.startDate ? new Date(this.startDate) : null;
    if (start) start.setHours(0, 0, 0, 0);

    // 解析篩選的結束日期，並將時間部分設定為當天 23:59:59.999，確保包含當天所有時間
    const end = this.endDate ? new Date(this.endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    // 如果有設定開始日期或結束日期，則執行篩選邏輯
    if (start || end) {
      filteredData = filteredData.filter(record => {
        const recordDate = new Date(record.createDate); // 將每筆紀錄的創建日期轉換為 Date 物件

        // 檢查轉換後的日期是否有效 (避免日期格式錯誤導致 NaN)
        if (isNaN(recordDate.getTime())) {
          console.warn(`警告：轉帳記錄中存在無效的日期格式: ${record.createDate}`);
          return false; // 跳過此筆無效日期的記錄
        }

        let match = true; // 預設此筆記錄符合篩選條件
        // 如果有設定開始日期，檢查記錄日期是否在開始日期之後或與開始日期相同
        if (start) {
          match = match && recordDate.getTime() >= start.getTime();
        }
        // 如果有設定結束日期，檢查記錄日期是否在結束日期之前或與結束日期相同
        if (end) {
          match = match && recordDate.getTime() <= end.getTime();
        }
        return match; // 返回此筆記錄是否符合所有篩選條件
      });
    }

    // 將篩選後的資料存到一個屬性，供分頁切片用
    (this as any)._filteredTransferRecords = filteredData;
    this.totalItems = filteredData.length; // 更新顯示的總筆數為篩選後的數量

    // 呼叫分頁切片方法，確保只顯示分頁範圍資料
    this.updatePagedData();

    // 如果分頁器存在，將其重置到第一頁，以便顯示篩選後的數據
    if (this.paginator) {
      this.paginator.firstPage();
    }

    // 如果篩選後沒有任何數據，且使用者有輸入日期區間，且已經選擇了帳戶，則顯示提示
    if (filteredData.length === 0 && (this.startDate || this.endDate) && this.currentBalanceId !== null) {
      Swal.fire('提示', '在選擇的日期區間內沒有找到轉帳紀錄。', 'info');
    }

    console.log('dataSource.data', this.dataSource.data, 'currentBalanceId', this.currentBalanceId, 'startDate', this.startDate, 'endDate', this.endDate);
  }

  /**
   * 補充：根據 currentPage/itemsPerPage 更新表格顯示資料
   * 只顯示分頁範圍內的資料，無資料時只顯示一行空狀態。
   */
  updatePagedData(): void {
    // 取得目前篩選後的資料來源
    const filteredData = (this as any)._filteredTransferRecords || [];
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.dataSource.data = filteredData.slice(startIndex, endIndex);
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
    // 滾動到表格頂部
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
}
