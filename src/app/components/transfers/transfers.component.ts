// 導入 Angular 核心模組和功能
import { Component, OnInit, ViewChild } from '@angular/core'; // Component: 定義元件; OnInit: 生命週期鉤子; ViewChild: 獲取模板元素
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core'; // Material Datepicker 相關設定
import { MatDatepickerModule } from '@angular/material/datepicker'; // Material Datepicker 模組
import { MatFormFieldModule } from '@angular/material/form-field'; // Material 表單欄位模組
import { MatIconModule } from '@angular/material/icon'; // Material 圖標模組
import { MatInputModule } from '@angular/material/input'; // Material 輸入框模組
import { MatSelectModule } from '@angular/material/select'; // Material 選擇框模組
import { DatePipe, registerLocaleData, CommonModule } from '@angular/common'; // DatePipe: 格式化日期; registerLocaleData/CommonModule: 語言環境和通用模組
import localeZh from '@angular/common/locales/zh'; // 導入中文語言環境資料
import { FormsModule, NgModel } from '@angular/forms'; // FormsModule: 支援模板驅動表單; NgModel: 用於獲取表單控制項實例
import { Account, TransferRequest } from '../../models/transfers'; // 導入定義好的資料模型 (介面)
import { ApiService } from '../../@services/api.service'; // 導入與後端 API 互動的服務
import Swal from 'sweetalert2'; // 導入 SweetAlert2 函式庫，用於美觀的彈出視窗
import { Router } from '@angular/router'; // 導入 Router 服務，用於導航

// 註冊中文語言環境數據，用於日期格式化
registerLocaleData(localeZh, 'zh-TW');

// 定義 Angular 元件
@Component({
  selector: 'app-transfers', // 元件的 HTML 標籤名稱，例如 <app-transfers></app-transfers>
  // 導入元件所需的其他 Angular 模組和 Material UI 模組
  imports: [
    CommonModule,         // 包含 NgIf, NgFor, DatePipe 等通用 Angular 指令/管道
    MatFormFieldModule,   // Material 設計的表單欄位外觀
    MatInputModule,       // Material 設計的輸入框
    MatDatepickerModule,  // Material 設計的日期選擇器
    MatIconModule,        // Material 設計的圖標
    MatSelectModule,      // Material 設計的選擇器 (下拉選單)
    FormsModule           // 支援 Angular 模板驅動表單的雙向綁定 (ngModel)
  ],
  // 為元件提供服務，這裡提供日期選擇器的本地化設定和 DatePipe 服務
  providers: [
    provideNativeDateAdapter(),                     // 為 Material 日期選擇器提供原生日期適配器
    { provide: MAT_DATE_LOCALE, useValue: 'zh-TW' }, // 設定日期選擇器的語言環境為繁體中文
    DatePipe                                        // 提供 DatePipe 服務，用於在 TS 中格式化日期
  ],
  templateUrl: './transfers.component.html', // 指定元件的 HTML 模板檔案路徑
  styleUrl: './transfers.component.scss'     // 指定元件的 CSS 樣式檔案路徑
})
export class TransfersComponent implements OnInit { // 實作 OnInit 介面，表示元件初始化時會執行 ngOnInit 方法

  // 構造函數 (Constructor)：當 Angular 建立這個元件的實例時會執行
  // 這裡注入了所需的服務：ApiService 用於 API 呼叫，Router 用於路由，DatePipe 用於日期格式化
  constructor(private apiService: ApiService, private router: Router, private datePipe: DatePipe) { }

  // @ViewChild 裝飾器：用於從元件的模板 (HTML) 中獲取對元素的引用
  // 透過 #templateReferenceVariable (如 #fromBalanceField) 來指定要獲取的元素
  // 獲取的實例類型是 NgModel，它代表了表單控制項的狀態和值
  // `!` (非空斷言運算符): 告訴 TypeScript 這個屬性在運行時會被賦值，不會是 null 或 undefined
  // @ViewChild('transferDateField') transferDateField!: NgModel; // 轉帳日期欄位 (已註解在 HTML 中)
  @ViewChild('fromBalanceField') fromBalanceField!: NgModel;     // 轉出帳戶選擇框
  @ViewChild('toBalanceField') toBalanceField!: NgModel;         // 轉入帳戶輸入框
  @ViewChild('amountField') amountField!: NgModel;               // 轉帳金額輸入框
  @ViewChild('descriptionField') descriptionField!: NgModel;     // 備註說明輸入框


  // 宣告對應 HTML 表單欄位的屬性，用於雙向數據綁定 ([(ngModel)])
  fromBalance: number | null = null;   // 轉出子帳戶 ID，初始化為 null (讓required驗證能正確觸發)
  toBalance: number | null = null;     // 轉入子帳戶 ID，初始化為 null
  transferDateString: string | Date = ''; // 轉帳日期字串，可以接受 string 或 Date 類型，即使在 HTML 中註解掉，這裡仍然保留以備未來使用
  amount: number | null = null;        // 轉帳金額，初始化為 null
  description?: string;                // 備註，可選屬性 (使用 `?` 表示可能為 undefined)

  // 表單狀態與錯誤提示相關的屬性
  accounts: Account[] = [];            // 儲存從後端獲取的帳戶清單
  isLoading: boolean = false;          // 標誌是否正在執行轉帳操作，用於禁用按鈕以防止重複提交

  today: string = '';                  // 儲存當天的日期字串，格式為 YYYY-MM-DD

  // ngOnInit 生命週期鉤子：元件初始化時執行 (只執行一次)
  ngOnInit() {
    // 初始化 `today` 屬性為當前日期，並使用 DatePipe 格式化為 'YYYY-MM-DD'
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    // 雖然轉帳日期在 HTML 中被註解掉，但如果未來需要，這裡可以設定初始值
    // this.transferDateString = this.today;

    const accountString = 'a6221339'; // 帳戶查詢字串，假設為登入帳號，硬編碼用於範例

    // 呼叫 ApiService 的 getBalanceByAccount 方法，從後端取得帳戶列表
    this.apiService.getBalanceByAccount(accountString)
      .then(resp => { // API 呼叫成功時執行
        console.log('後端回來的帳戶資料:', resp); // 在控制台印出完整的後端回應

        const list = resp.data.balanceList; // 從後端回應中取出帳戶清單數據

        // 檢查 `list` 是否為陣列，並賦值給 `accounts`
        if (Array.isArray(list)) {
          this.accounts = list;
        } else {
          this.accounts = []; // 如果不是陣列，則清空帳戶列表
        }
      })
      .catch(err => { // API 呼叫失敗時執行
        console.error('取得帳戶列表失敗', err); // 在控制台印出錯誤訊息

        // 使用 SweetAlert2 彈出錯誤提示
        Swal.fire({
          icon: 'error',        // 顯示錯誤圖標
          title: '讀取失敗',    // 彈出視窗標題
          text: '無法取得帳戶清單，請稍後再試。', // 錯誤訊息內容
          confirmButtonText: '確定' // 確認按鈕文字
        });
      });
  }

  /**
   * 處理數字輸入框的鍵盤事件，阻止上下箭頭增減數值
   * 當使用者按下「上箭頭」或「下箭頭」鍵時，阻止其預設行為（增減數字）
   * @param event 鍵盤事件物件
   */
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault(); // 阻止瀏覽器的預設行為
    }
  }

  /**
   * 處理數字輸入框的滑鼠滾輪事件，阻止增減數值
   * 當使用者在數字輸入框上滾動滑鼠滾輪時，阻止其預設行為（增減數字）
   * @param event 滑鼠滾輪事件物件
   */
  onWheel(event: Event) {
    event.preventDefault(); // 阻止瀏覽器的預設行為
  }

  /**
   * 使用者按下「確認轉帳」按鈕時呼叫
   * 負責前端驗證、組裝請求數據並呼叫後端 API
   */
  onSubmit() {
    // 4. 前端基本驗證：
    // 手動將所有表單欄位標記為 `touched` (已觸碰過)，
    // 這樣即使使用者沒有點擊過這些欄位，也會立即觸發 `mat-error` 的錯誤提示顯示
    // this.transferDateField.control.markAsTouched(); // 轉帳日期欄位已註解
    this.fromBalanceField.control.markAsTouched();
    this.toBalanceField.control.markAsTouched();
    this.amountField.control.markAsTouched();
    this.descriptionField.control.markAsTouched(); // 備註是選填，但標記為 touched 以顯示長度限制等錯誤


    // 綜合檢查，判斷整體表單是否有效
    // 透過 NgModel 的 `invalid` 屬性來檢查 HTML 內建的 `required`, `min`, `maxlength` 等驗證規則
    if (//this.transferDateField.invalid || // 轉帳日期欄位已註解，故不參與此處驗證
        this.fromBalanceField.invalid ||
        this.toBalanceField.invalid ||
        this.amountField.invalid ||
        this.descriptionField.invalid) { // 備註若超過 maxlength 也會 invalid
      // 如果有任何驗證不通過，彈出錯誤提示並終止函式執行
      Swal.fire({
        icon: 'error',
        title: '表單資料有誤',
        text: '請檢查表單欄位及輸入的金額和帳戶是否有效。',
        confirmButtonText: '確定'
      });
      return; // 終止後續程式碼執行
    }

    // 驗證轉出帳戶與轉入帳戶是否相同 (業務邏輯驗證)
    if (this.toBalance === this.fromBalance) {
      Swal.fire({
        icon: 'error',
        title: '帳戶錯誤',
        text: '轉出與轉入帳戶相同',
        confirmButtonText: '確定'
      });
      return; // 終止後續程式碼執行
    }

    // 備註邏輯：如果備註為空，設定預設值 '無備註'
    if (this.description === undefined || this.description === null || this.description.trim() === '') {
      this.description = '無備註';
    }

    // 備註字數檢查 (雖然 HTML 已經有 maxlength，這裡作為額外保障)
    if ((this.description || '').length > 200) {
      Swal.fire({
        icon: 'error',
        title: '備註錯誤',
        text: '備註最多 200 字',
        confirmButtonText: '確定'
      });
      return; // 終止後續程式碼執行
    }

    // 5. 顯示載入狀態：開始發送 API 請求前，設定 isLoading 為 true，禁用按鈕
    this.isLoading = true;

    // ****** 根據後端 Swagger 文件，組裝要發送給後端的 `payload` 物件 ******
    // payload 應只包含後端 DTO (CreateTransfersRequest) 所期望的欄位
    const payload: TransferRequest = {
      fromBalance: this.fromBalance!, // `!` (非空斷言): 告訴 TypeScript，在此處 `fromBalance` 肯定有值 (因為前面已通過驗證)
      toBalance: this.toBalance!,     // 同上
      amount: this.amount!,           // 同上
      description: this.description   // 後端 Swagger 顯示有此欄位，所以包含
      // 注意：transferDate 和 fee 已從後端請求中移除，因此這裡不再包含
    };
    // ***************************************************************************************************


    // 8. 測試用：在控制台印出最終提交的 `payload`，確認數據結構和值是否正確
    console.log('--- API 呼叫前最終檢查 ---');
    console.log('提交的 payload:', payload);
    console.log('payload.fromBalance 的值:', payload.fromBalance);
    console.log('payload.toBalance 的值:', payload.toBalance);
    console.log('--------------------');


    // 10. 呼叫真實 API 進行轉帳
    this.apiService.createTransfers(payload)
      .then(resp => { // Promise 成功解決時 (HTTP 狀態碼 2xx)
        const result = resp.data; // 從 Axios 回應中取出後端回傳的數據 (例如 { code: 200, message: "成功！" })

        // 根據後端 ResponseMessages 列舉，判斷 `result.code` 是否為 `200` (成功代碼)
        if (result.code == 200) {
          // 轉帳成功時，彈出成功的 SweetAlert 提示
          Swal.fire({
            icon: 'success',  // 顯示成功圖標
            title: '轉帳成功', // 彈出視窗標題
            text: '轉帳成功！', // 顯示成功的訊息，由於後端未回傳 ID，這裡不嘗試顯示 ID
            confirmButtonText: '確定'
          }).then(() => {
            this.resetForm(); // 使用者點擊「確定」後，重置表單
          });
        } else {
          // 如果後端回傳的 `code` 不是 `200` (表示業務邏輯失敗，但 HTTP 狀態碼可能是 200)
          // 彈出錯誤提示，顯示後端回傳的錯誤訊息
          Swal.fire({
            icon: 'error',
            title: '轉帳失敗',
            text: result.message || '發生未知錯誤', // 顯示後端訊息，若無則顯示通用訊息
            confirmButtonText: '確定'
          });
        }
      })
      .catch(err => { // Promise 失敗解決時 (HTTP 狀態碼非 2xx，如 400, 500，或網路錯誤)
        // 在控制台印出完整的錯誤物件和回應，用於除錯
        console.error('API 呼叫失敗 (完整錯誤物件):', err);
        console.error('API 錯誤回應 (如果存在):', err.response);

        // 建立一個預設的錯誤訊息
        let errorMessage = '伺服器或網路錯誤，請稍後再試。';
        // 嘗試從 Axios 錯誤回應中獲取後端提供的具體錯誤訊息
        if (err.response && err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message; // 如果後端有提供具體訊息，則使用
        } else if (err.message) {
            errorMessage = err.message; // 如果是 Axios 自身的錯誤訊息 (如 "Network Error")
        }

        // 彈出錯誤提示，顯示更具體的錯誤訊息
        Swal.fire({
          icon: 'error',
          title: '轉帳失敗',
          text: errorMessage,
          confirmButtonText: '確定'
        });
      })
      .finally(() => { // 無論 Promise 成功或失敗，最後都會執行此區塊
        this.isLoading = false; // 解除載入狀態，啟用按鈕
      });
  }

  /**
   * 重置表單的邏輯：清空所有輸入框並重置其狀態
   */
  resetForm() {
    // 將表單綁定的數據重置為初始值 (null 或 undefined)
    this.fromBalance = null;
    this.toBalance = null;
    // this.transferDateString = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || ''; // 轉帳日期功能已註解，這裡也註解
    this.amount = null;
    this.description = undefined; // 將備註重置為 undefined
    this.isLoading = false;

    // 使用 setTimeout 確保 NgModel 在數據重置後有足夠時間更新其內部狀態，
    // 然後再執行 `markAsUntouched()` 和 `markAsPristine()`
    setTimeout(() => {
      // 檢查 @ViewChild 引用是否存在，以確保安全呼叫 (防止元件尚未完全渲染導致的錯誤)
      // if (this.transferDateField) { // 轉帳日期欄位已註解
      //   this.transferDateField.control.markAsUntouched(); // 標記為未觸碰
      //   this.transferDateField.control.markAsPristine();    // 標記為原始狀態 (未修改)
      // }
      if (this.fromBalanceField) {
        this.fromBalanceField.control.markAsUntouched();
        this.fromBalanceField.control.markAsPristine();
      }
      if (this.toBalanceField) {
        this.toBalanceField.control.markAsUntouched();
        this.toBalanceField.control.markAsPristine();
      }
      if (this.amountField) {
        this.amountField.control.markAsUntouched();
        this.amountField.control.markAsPristine();
      }
      if (this.descriptionField) {
        this.descriptionField.control.markAsUntouched();
        this.descriptionField.control.markAsPristine();
      }
    });
  }

  /**
   * 使用者點擊「取消」按鈕時呼叫
   * 導航回首頁 (或指定的路由)
   */
  onCancel() {
    this.router.navigate(['/home']); // 導航到 `/home` 路徑
  }

  /**
   * 處理轉入帳戶建議列表的點擊事件
   * 用於選擇或取消選擇轉入帳戶
   * @param id 被點擊的帳戶 ID
   */
  toggleToAccount(id: number) {
    // 如果當前 `toBalance` 已經是這個 `id`，則將 `toBalance` 設為 `null` (取消選擇)
    // 否則，將 `toBalance` 設為這個 `id` (選擇)
    this.toBalance === id ? this.toBalance = null : this.toBalance = id;
  }
}
