import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit } from '@angular/core'; // 引入 OnInit 介面，表示元件有生命週期方法 ngOnInit
import { FormsModule } from '@angular/forms'; // 用於雙向綁定 (ngModel)
import { ActivatedRoute, RouterModule } from '@angular/router'; // ActivatedRoute 用於獲取路由參數，RouterModule 用於路由功能
import { ApiService } from '../../@services/api.service'; // 導入自訂的 API 服務，用於與後端互動
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator'; // Angular Material 分頁器相關模組
import { MatSort, MatSortModule } from '@angular/material/sort'; // Angular Material 排序器相關模組
import { MatTableDataSource, MatTableModule } from '@angular/material/table'; // Angular Material 表格數據源和表格模組
import { MatFormFieldModule } from '@angular/material/form-field'; // Angular Material 表單欄位模組
import { MatIconModule } from '@angular/material/icon'; // Angular Material 圖標模組
import { MatInputModule } from '@angular/material/input'; // Angular Material 輸入框模組
// 導入自訂的模型介面，確保數據結構的型別安全
import { Transfer, ApiResponse, Account } from '../../models/transfers';
import Swal from 'sweetalert2'; // 導入 SweetAlert2 函式庫，用於美觀的彈出視窗

// @Component 裝飾器定義了 Angular 元件的元數據
@Component({
  selector: 'app-transfer-history', // 元件的選擇器名稱，用於在 HTML 模板中使用 <app-transfer-history>
  // imports 陣列中列出了此元件所需的 Angular 模組，使得它們提供的指令、管道、元件等可用於此元件的模板
  imports: [
    CommonModule, // 提供 *ngIf, *ngFor 等常見指令
    RouterModule, // 提供路由相關指令，例如 routerLink
    FormsModule, // 提供 ngModel 等表單相關功能
    MatFormFieldModule, // Material Design 表單欄位外觀
    MatInputModule, // Material Design 輸入框樣式
    MatTableModule, // Material Design 表格
    MatPaginatorModule, // Material Design 分頁器
    MatSortModule, // Material Design 排序器
    MatIconModule, // Material Design 圖標
  ],
  templateUrl: './transfer-history.component.html', // 元件的 HTML 模板檔案路徑
  styleUrl: './transfer-history.component.scss' // 元件的 SCSS 樣式檔案路徑
})
// export class TransferHistoryComponent implements OnInit 宣告元件類別，並實作 OnInit 介面
// 實作 OnInit 介面代表此元件有一個 ngOnInit 方法，會在元件初始化時執行
export class TransferHistoryComponent implements OnInit {

  // 構造函數 (Constructor) 用於注入服務
  constructor(
    private api: ApiService, // 注入 ApiService，用於呼叫後端 API
    private paginatorIntl: MatPaginatorIntl, // 注入 MatPaginatorIntl，用於自訂分頁器的文字
    private route: ActivatedRoute // 注入 ActivatedRoute，用於從路由中獲取參數
  ) {}

  // 定義表格要顯示的欄位標識符，這些名稱必須與 Transfer 介面中的屬性名稱一致
  displayedColumns: string[] = ['transfersId', 'createDate', 'fromBalanceId', 'toBalanceId', 'amount', 'description'];

  // MatTableDataSource 是 Angular Material 表格的數據源，泛型 <Transfer> 表示數據的型別是 Transfer 介面
  // 初始時設定為空陣列
  dataSource = new MatTableDataSource<Transfer>([]);
  totalItems = 0; // 當前表格顯示的總筆數 (可能在篩選後變化)
  pageSize = 5; // 每頁顯示的數據筆數
  lastTransactionDate: string = ''; // 記錄最後一筆交易的日期字串
  startDate: string = ''; // 用於日期篩選的起始日期 (由使用者輸入)
  endDate: string = ''; // 用於日期篩選的結束日期 (由使用者輸入)
  // 獲取今天的日期，並格式化為 'YYYY-MM-DD' 字符串，用於設定日期選擇器的最大值
  today: string = new Date().toISOString().split('T')[0];

  // 私有變數，用於儲存從後端一次性獲取的所有原始轉帳紀錄，不受篩選影響
  private _allTransferRecords: Transfer[] = [];
  // 公有變數，用於儲存從路由參數或其他方式獲取的當前查看的帳戶 ID
  // 設為 public 是因為它需要在 HTML 模板中被訪問（例如用於判斷金額顏色）
  public currentBalanceId: number | null = null;

  // 私有變數，用 Map 數據結構儲存帳戶 ID 到帳戶名稱的映射
  // Map 提供高效的查找功能，用於將 fromBalanceId/toBalanceId 轉換為可讀的名稱
  private accountNameMap: Map<number, string> = new Map();

  // @ViewChild 裝飾器用於獲取模板中特定元素的實例
  // paginator 和 sort 是 Material Table 的兩個重要組件，用於分頁和排序功能
  @ViewChild(MatPaginator) paginator!: MatPaginator; // 非空斷言操作符 ! 表示該屬性會被 Angular 初始化，不會為 null
  @ViewChild(MatSort) sort!: MatSort; // 非空斷言操作符 !

  // ngOnInit 是一個生命週期鉤子，在 Angular 元件初始化完成後（即構造函數執行後）立即調用
  ngOnInit(): void {
    // **設定 Material 分頁器的國際化文字**
    this.paginatorIntl.itemsPerPageLabel = '每頁筆數：';
    this.paginatorIntl.nextPageLabel = '下一頁';
    this.paginatorIntl.previousPageLabel = '上一頁';
    this.paginatorIntl.firstPageLabel = '第一頁';
    this.paginatorIntl.lastPageLabel = '最後一頁';

    // 測試用：固定設定一個 currentBalanceId 值
    // 在真實應用中，這個值應該從路由參數、用戶登入資訊或選中的帳戶中動態獲取
    this.currentBalanceId = 1;
    console.log('當前查看的帳戶 ID:', this.currentBalanceId);

    // --- 👇 初始化數據載入流程：確保帳戶名稱和轉帳紀錄按正確順序載入 👇 ---
    // 顯示一個 SweetAlert2 載入提示，告知使用者資料正在載入中
    Swal.fire({
      title: '載入中...',
      text: '正在初始化資料，請稍候。',
      allowOutsideClick: false, // 不允許使用者點擊彈窗外部關閉它
      didOpen: () => {
        Swal.showLoading(); // 顯示載入動畫
      }
    });

    // 步驟 1: 載入帳戶名稱。這是一個非同步操作，返回一個 Promise。
    this.loadAccountNames()
      .then(() => {
        // 當 loadAccountNames 成功完成後執行此區塊
        console.log("帳戶名稱已成功載入。");

        // 在載入轉帳資料前，檢查 currentBalanceId 是否已設定。
        // 如果沒有設定，則拋出錯誤，讓下方的 .catch 捕獲。
        if (this.currentBalanceId === null) {
          throw new Error('Current Balance ID 未設定，無法載入轉帳紀錄。');
        }
        // 步驟 2: 載入轉帳紀錄。這個方法也返回一個 Promise。
        // 使用 return 確保這個 Promise 被鏈接到下一個 .then
        return this.loadAllTransfersForCurrentBalance();
      })
      .then(() => {
        // 當 loadAllTransfersForCurrentBalance 成功完成後執行此區塊
        Swal.close(); // 關閉 SweetAlert2 載入提示，表示所有數據都已成功載入
        console.log("所有轉帳資料載入完成。");
      })
      .catch(error => {
        // 如果上述 Promise 鏈中任何一個環節發生錯誤，此區塊將被執行
        Swal.close(); // 關閉載入提示 (無論成功或失敗)
        console.error('初始化失敗：載入帳戶名稱或轉帳資料時出錯！', error); // 在控制台印出錯誤訊息
        Swal.fire('錯誤', '載入資料時發生錯誤，請稍後再試。', 'error'); // 彈出錯誤提示給使用者
        // 清空表格數據，避免顯示不完整的或錯誤的數據
        this.dataSource.data = [];
        this.totalItems = 0;
      });
    // --- 👆 初始化數據載入流程結束 👆 ---

    // 原始訂閱路由參數的程式碼 (當有登入功能時，通常會在這裡動態獲取 balanceId)
    // 目前保持註解，因為我們在上方設定了固定的 this.currentBalanceId = 1;
    /*
    this.route.paramMap.subscribe(params => {
      const id = params.get('balanceId'); // 從路由中獲取 'balanceId' 參數 (字符串型態)
      if (id) {
        this.currentBalanceId = +id; // 將字符串轉換為數字 (+id 是 TypeScript/JavaScript 的一個技巧)

        // 在獲取到新的 balanceId 後，重新執行數據載入流程
        Swal.fire({
          title: '載入中...',
          text: '正在初始化資料，請稍候。',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        this.loadAccountNames() // 再次載入帳戶名稱
          .then(() => this.loadAllTransfersForCurrentBalance()) // 再次載入轉帳紀錄
          .then(() => Swal.close())
          .catch(error => {
            Swal.close();
            console.error('載入資料失敗:', error);
            Swal.fire('錯誤', '無法載入轉帳紀錄。', 'error');
            this.dataSource.data = [];
            this.totalItems = 0;
          });
      } else {
        // 如果路由中沒有提供 balanceId，則給出警告並顯示錯誤提示
        console.warn('沒有找到 balanceId 路由參數，無法載入轉帳紀錄。');
        Swal.fire('錯誤', '未指定帳戶 ID，無法載入轉帳紀錄。', 'error');
        this.dataSource.data = [];
        this.totalItems = 0;
      }
    });
    */
  }

  /**
   * 私有方法：負責從後端載入所有帳戶的名稱並建立映射表。
   * @returns Promise<void> - 返回一個 Promise，表示非同步操作完成。
   */
  private loadAccountNames(): Promise<void> {
    // **重要：這裡的 'a6221339' 是寫死 (hardcoded) 的測試用戶帳號。**
    // 在未來，當你的應用程式有完整的登入功能時，這個值應該被替換為實際登入用戶的帳號。
    // 例如：可以從一個認證服務 (AuthService) 或狀態管理中獲取。
    const testAccount = 'a6221339';

    // 檢查用戶帳號是否有效，如果為空則直接拒絕 Promise
    if (!testAccount) {
      console.error('無法載入帳戶名稱：缺少用戶帳戶信息。');
      return Promise.reject('缺少用戶帳戶信息');
    }

    // 呼叫 ApiService 的 getBalanceByAccount 方法來獲取帳戶列表
    return this.api.getBalanceByAccount(testAccount)
      .then(resp => {
        // 檢查 API 回應的數據結構是否符合預期（必須有 data 且 data.balanceList 是陣列）
        if (resp.data && Array.isArray(resp.data.balanceList)) {
          this.accountNameMap.clear(); // 在填充前，先清空舊的映射表
          // 遍歷後端返回的每個帳戶物件
          resp.data.balanceList.forEach((account: Account) => {
            // 將每個帳戶的 balanceId 作為 key，name 作為 value 存入 Map
            this.accountNameMap.set(account.balanceId, account.name);
          });
          console.log('帳戶名稱映射已成功載入:', this.accountNameMap);
        } else {
          // 如果數據結構不符，則發出警告
          console.warn('API 回應的帳戶資料結構不符合預期', resp);
        }
      })
      .catch(error => {
        // 如果 API 呼叫失敗，則在控制台記錄錯誤並重新拋出錯誤，以便上層的 .catch 也能處理
        console.error('獲取帳戶名稱失敗！', error);
        throw error;
      });
  }

  /**
   * 私有方法：從後端載入指定 `currentBalanceId` 的所有轉帳資料。
   * 此方法被設計為不包含 SweetAlert2 載入提示的邏輯，這些提示由 `ngOnInit` 統一管理。
   * @returns Promise<void> - 返回一個 Promise，表示非同步操作完成。
   */
  private loadAllTransfersForCurrentBalance(): Promise<void> {
    // 檢查 `currentBalanceId` 是否已設定，如果為 `null`，則表示無法載入數據
    // 返回一個被拒絕的 Promise，錯誤訊息會被 `ngOnInit` 的 `.catch` 捕獲
    if (this.currentBalanceId === null) {
      return Promise.reject('currentBalanceId 未設定，無法載入轉帳紀錄。');
    }

    // 呼叫 ApiService 的 getAllTransfersByBalanceId 方法，獲取轉帳紀錄
    return this.api.getAllTransfersByBalanceId(this.currentBalanceId)
      .then(resp => {
        let data: Transfer[] = []; // 初始化一個空陣列來存放解析後的轉帳數據

        // 檢查 API 回應的數據結構，確保有 `data` 且 `data.transfersList` 是陣列
        if (resp.data && resp.data.transfersList && Array.isArray(resp.data.transfersList)) {
          data = resp.data.transfersList as Transfer[]; // 將數據類型斷言為 Transfer 陣列
        } else {
          // 如果數據結構不符，則發出警告
          console.warn('API 回應的資料結構不符合預期', resp);
        }

        this._allTransferRecords = data; // 將獲取到的轉帳紀錄儲存到私有變數
        this.applyDateFilter(); // 數據載入後，立即應用日期篩選（即使沒有篩選條件也會全部顯示）

        // 更新最後一筆交易的日期（假設列表中的第一筆是最新一筆，如果後端沒有排序，可能需要前端排序）
        if (this._allTransferRecords.length > 0) {
          this.lastTransactionDate = this._allTransferRecords[0].createDate;
        } else {
          this.lastTransactionDate = ''; // 如果沒有數據，則清空日期
          // 這裡不彈出 Swal 提示「沒有找到任何轉帳紀錄」，這個提示由 HTML 模板的 `@if` 和 `applyDateFilter` 統一處理
        }
      })
      .catch(error => {
        // 如果 API 呼叫失敗，在控制台記錄錯誤並重新拋出，讓 `ngOnInit` 的 `.catch` 處理統一的錯誤提示
        console.error('載入轉帳資料失敗！', error);
        throw error; // 繼續拋出錯誤，確保錯誤被 Promise 鏈中的下一個 catch 捕獲
      });
  }

  /**
   * 公有方法：用於在 HTML 模板中，根據帳戶 ID 獲取其對應的帳戶名稱。
   * 如果找到名稱，則返回 "名稱 (ID)" 的格式；如果找不到，則僅返回 "ID: [ID]"。
   * @param balanceId 帳戶的數字 ID
   * @returns string - 返回格式化後的帳戶名稱或 ID 字符串。
   */
  public getAccountName(balanceId: number): string {
    // 嘗試從 Map 中獲取帳戶名稱
    const accountName = this.accountNameMap.get(balanceId);

    if (accountName) {
      // 如果找到了名稱，返回 "名稱 (ID)" 的格式
      return `${accountName} (${balanceId})`;
    } else {
      // 如果沒有找到名稱 (可能是非自有帳戶，或 Map 尚未載入完成，或 ID 無效)，
      // 則只返回 "ID: [ID]" 的格式。
      return `ID: ${balanceId}`;
    }
  }

  /**
   * 純前端的日期區間篩選方法。
   * 此方法根據 `startDate` 和 `endDate` 篩選 `_allTransferRecords` 中的數據，
   * 並更新 `dataSource` 和表格顯示。
   */
  applyDateFilter(): void {
    // 創建原始數據 `_allTransferRecords` 的副本，避免直接修改原始數據
    let filteredData = [...this._allTransferRecords];

    // 解析篩選的開始日期
    let start: Date | null;
    if (this.startDate) { // 如果 `startDate` 有值 (不是空字串)
      start = new Date(this.startDate); // 將其轉換為 Date 物件
    } else {
      start = null; // 否則設定為 null
    }

    // 解析篩選的結束日期
    let end: Date | null;
    if (this.endDate) { // 如果 `endDate` 有值
      end = new Date(this.endDate); // 將其轉換為 Date 物件
    } else {
      end = null; // 否則設定為 null
    }

    // 如果有設定開始日期或結束日期，則執行篩選邏輯
    if (start || end) {
      filteredData = filteredData.filter(record => {
        const recordDate = new Date(record.createDate); // 將每筆紀錄的創建日期轉換為 Date 物件

        // 檢查轉換後的日期是否有效 (避免日期格式錯誤導致 NaN)
        if (isNaN(recordDate.getTime())) {
          console.warn(`警告：無效的日期格式在轉帳記錄中: ${record.createDate}`);
          return false; // 跳過此筆無效日期的記錄
        }

        let match = true; // 預設此筆記錄符合篩選條件
        // 如果有設定開始日期
        if (start) {
          start.setHours(0, 0, 0, 0); // 將開始日期時間設定為當天 00:00:00.000
          // 檢查記錄日期是否在開始日期之後或與開始日期相同
          match = match && recordDate.getTime() >= start.getTime();
        }
        // 如果有設定結束日期
        if (end) {
          end.setHours(23, 59, 59, 999); // 將結束日期時間設定為當天 23:59:59.999
          // 檢查記錄日期是否在結束日期之前或與結束日期相同
          match = match && recordDate.getTime() <= end.getTime();
        }
        return match; // 返回此筆記錄是否符合所有篩選條件
      });
    }

    // 更新 MatTableDataSource 的數據源為篩選後的數據
    this.dataSource.data = filteredData;
    this.totalItems = filteredData.length; // 更新顯示的總筆數為篩選後的數量

    // 重新設定分頁器和排序器，以應用於新的篩選數據
    // 這是必要的，因為數據源變化後，分頁和排序器需要重新綁定
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // 如果篩選後沒有任何數據，且使用者有輸入日期區間，則顯示提示
    if (filteredData.length === 0 && (this.startDate || this.endDate)) {
      Swal.fire('提示', '在選擇的日期區間內沒有找到轉帳紀錄。', 'info');
    }
  }

  /**
   * 當日期篩選器（開始日期或結束日期）的值發生變化時觸發的方法。
   * 呼叫 `applyDateFilter()` 來重新篩選數據。
   */
  onDateRangeChange(): void {
    this.applyDateFilter();
  }
}
