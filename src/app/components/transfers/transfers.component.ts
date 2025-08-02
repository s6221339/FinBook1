import { AuthService } from './../../@services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Account, TransferRequest } from '../../models/transfers';
import { ApiService } from '../../@services/api.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CreateTransferRequest } from '../../models/request/createTransferRequest';

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.scss'
})
export class TransfersComponent implements OnInit { // 實作 OnInit 介面，表示元件初始化時會執行 ngOnInit 方法

  // 構造函數 (Constructor)：當 Angular 建立這個元件的實例時會執行
  // 這裡注入了所需的服務：ApiService 用於 API 呼叫，Router 用於路由，DatePipe 用於日期格式化
  constructor(
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService
  ) {}

  // 表單數據
  fromBalance: number | null = null;
  toBalance: number | null = null;
  amount: number | null = null;
  description?: string;

  // 表單狀態
  accounts: Account[] = [];
  isLoading: boolean = false;

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    const accountString = currentUser?.account;

    if(!accountString) {
      Swal.fire({
        icon: 'error',
        title: '尚未登入',
        text: '請先登入以載入帳戶清單',
        confirmButtonText: '確定'
      });
      return;
    }

    // 載入帳戶列表
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
   * 表單驗證
   */
  private validateForm(): boolean {
    // 檢查必填欄位
    if (!this.fromBalance) {
      Swal.fire({
        icon: 'error',
        title: '表單資料有誤',
        text: '請選擇轉出帳戶',
        confirmButtonText: '確定'
      });
      return false;
    }

    if (!this.toBalance) {
      Swal.fire({
        icon: 'error',
        title: '表單資料有誤',
        text: '請輸入轉入帳戶ID',
        confirmButtonText: '確定'
      });
      return false;
    }

    if (!this.amount || this.amount <= 0) {
      Swal.fire({
        icon: 'error',
        title: '表單資料有誤',
        text: '請輸入有效的轉帳金額',
        confirmButtonText: '確定'
      });
      return false;
    }

    // 驗證轉出帳戶與轉入帳戶是否相同 (業務邏輯驗證)
    if (this.toBalance === this.fromBalance) {
      Swal.fire({
        icon: 'error',
        title: '帳戶錯誤',
        text: '轉出與轉入帳戶相同',
        confirmButtonText: '確定'
      });
      return false;
    }

    // 備註字數檢查
    if (this.description && this.description.length > 200) {
      Swal.fire({
        icon: 'error',
        title: '備註錯誤',
        text: '備註最多 200 字',
        confirmButtonText: '確定'
      });
      return false;
    }

    return true;
  }

  /**
   * 提交轉帳
   */
  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    // 設定預設備註
    if (!this.description || this.description.trim() === '') {
      this.description = '無備註';
    }

    this.isLoading = true;

    // ****** 根據後端 Swagger 文件，組裝要發送給後端的 `payload` 物件 ******
    // payload 應只包含後端 DTO (CreateTransfersRequest) 所期望的欄位
    const payload: CreateTransferRequest = {
      fromBalance: this.fromBalance!, // `!` (非空斷言): 告訴 TypeScript，在此處 `fromBalance` 肯定有值 (因為前面已通過驗證)
      toAccount: String(this.toBalance),     // 同上
      amount: this.amount!,           // 同上
      description: this.description?.trim() ?? null,  // 後端 Swagger 顯示有此欄位，所以包含
      // 注意：transferDate 和 fee 已從後端請求中移除，因此這裡不再包含
    };

    // 8. 測試用：在控制台印出最終提交的 `payload`，確認數據結構和值是否正確
    console.log('提交的 payload:', payload);

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
      .catch(err => {
        console.error('API 呼叫失敗:', err);
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
          text: '請確認帳戶ID是否正確',
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
    this.amount = null;
    this.description = undefined; // 將備註重置為 undefined
    this.isLoading = false;
  }

  /**
   * 使用者點擊「取消」按鈕時呼叫
   * 導航回首頁 (或指定的路由)
   */
  onCancel() {
    this.router.navigate(['/home']);
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
