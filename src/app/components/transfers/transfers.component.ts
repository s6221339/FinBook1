import { Component, ViewChild} from '@angular/core';
import { MAT_DATE_LOCALE, provideNativeDateAdapter} from '@angular/material/core';
import { MatDatepickerModule} from '@angular/material/datepicker';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatIconModule} from '@angular/material/icon';
import { MatInputModule} from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import localeZh from '@angular/common/locales/zh';
import { FormsModule, NgModel } from '@angular/forms';
import { Account, TransferRequest } from '../../models/transfers';
import { ApiService } from '../../@services/api.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localeZh, 'zh-TW');

@Component({
  selector: 'app-transfers',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    MatSelectModule,
    FormsModule,
  ],
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'zh-TW' }
],
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.scss'
})
export class TransfersComponent {

  constructor(private apiService: ApiService, private router: Router) {}


  // 使用 @ViewChild 來獲取模板中的 NgModel 實例
  // 'static: true' 表示在變更偵測週期的第一次執行時就解析，適用於不會被 *ngIf 移除的元素
  // 但由於我們的 mat-error 可能有 @if，所以保持預設的 static: false (或不寫) 即可
  @ViewChild('transferDateField') transferDateField!: NgModel;
  @ViewChild('fromAccountField') fromAccountField!: NgModel;
  @ViewChild('toAccountField') toAccountField!: NgModel;
  @ViewChild('amountField') amountField!: NgModel;
  @ViewChild('feeField') feeField!: NgModel;
  @ViewChild('descriptionField') descriptionField!: NgModel;


  // 1. 宣告對應 HTML 表單欄位的屬性
  fromAccountId: number = 0;   // 轉出子帳戶 ID
  toAccountId: number | null = null;     // 轉入子帳戶 ID
  transferDateString: string = '';
  amount: number | null = null;   // 轉帳金額
  fee?: number;         // 手續費，可選
  description?: string; // 備註，可選

  // 2. 表單狀態與錯誤提示
  accounts: Account[] = [];    // 帳戶清單
  isLoading: boolean = false; // 是否正在執行轉帳，用於按鈕禁用

  today: string = ''; // 今天日期字串

  // 3. 載入完成後的初始化
  ngOnInit() {
    this.today = new Date().toISOString().split('T')[0]; // 初始化今天日期

    const accountString = 'a6221339'; // 帳戶查詢字串，假設為登入帳號
    // 呼叫帳戶 API 取得帳戶列表
    this.apiService.getBalanceByAccount(accountString)
      .then(resp => {
        console.log('後端回來的帳戶資料:', resp);

        const list = resp.data.balanceList;

        if (Array.isArray(list)) {
          this.accounts = list;
        } else {
          this.accounts = [];
        }
      })
      .catch(err => {
        console.error('取得帳戶列表失敗', err);
        Swal.fire({
          icon: 'error',
          title: '讀取失敗',
          text: '無法取得帳戶清單，請稍後再試。',
          confirmButtonText: '確定'
        });
      });
  }

  /**
   * 使用者按下「確認轉帳」時呼叫
   */
  onSubmit() {
    // 4. 前端基本驗證：
    // 手動將所有 NgModel 標記為 touched，以觸發 mat-error 顯示
    // 這樣比 document.querySelector 更 Angular 且更安全
    this.transferDateField.control.markAsTouched();
    this.fromAccountField.control.markAsTouched();
    this.toAccountField.control.markAsTouched();
    this.amountField.control.markAsTouched();
    // 手續費和備註是選填，但為了顯示錯誤（例如負數或超長），也可以標記
    this.feeField.control.markAsTouched();
    this.descriptionField.control.markAsTouched();


    // 綜合檢查，判斷整體表單是否有效
    // 透過 NgModel 的 valid 屬性來檢查 HTML 內建的 required, min, step, maxlength 等驗證
    if (this.transferDateField.invalid ||
        this.fromAccountField.invalid ||
        this.toAccountField.invalid ||
        this.amountField.invalid ||
        this.feeField.invalid ||
        this.descriptionField.invalid) {
      Swal.fire({
        icon: 'error',
        title: '表單資料有誤',
        text: '請檢查表單欄位及輸入的金額和帳戶是否有效。',
        confirmButtonText: '確定'
      });
      return;
    }

    // 驗證轉出與轉入帳戶是否相同
    if (this.toAccountId === this.fromAccountId) {
      Swal.fire({
        icon: 'error',
        title: '帳戶錯誤',
        text: '轉出與轉入帳戶相同',
        confirmButtonText: '確定'
      });
      return;
    }

    // 若 fee 為空值，設定預設值 0
    if (this.fee === undefined || this.fee === null) {
      this.fee = 0;
    }

    // 若 description 為空值，設定預設值 '無備註'
    if (this.description === undefined || this.description === null || this.description.trim() === '') {
      this.description = '無備註';
    }

    // 後端驗證的備註字數檢查（前端 HTML maxlength 已有，這是額外保障）
    if ((this.description || '').length > 200) {
      Swal.fire({
        icon: 'error',
        title: '備註錯誤',
        text: '備註最多 200 字',
        confirmButtonText: '確定'
      });
      return;
    }

    // 5. 清除錯誤訊息並顯示載入狀態
    this.isLoading = true;

    // 7. 組合成 transferRequest 物件，符合後端要求的欄位
    const payload: TransferRequest = {
      fromAccountId: this.fromAccountId,
      toAccountId: this.toAccountId!, // 這裡使用 ! (Non-null Assertion Operator) 斷言其不會是 null
      transferDate: this.transferDateString,
      amount: this.amount!, // 這裡使用 ! 斷言其不會是 null
      fee: this.fee,
      description: this.description
    };

    // 8. 測試用：印出 payload，確認組合正確
    console.log('提交的 payload:', payload);

    // 9. 假呼叫替代後端，模擬異步行為
    new Promise<void>(res => setTimeout(res, 500))
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: '轉帳成功',
          text: '假轉帳完成！',
          confirmButtonText: '確定'
        }).then(() => {
          this.resetForm(); // 成功後重置表單
        });
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: '轉帳失敗',
          text: '發生未知錯誤，請稍後再試。',
          confirmButtonText: '確定'
        });
      })
      .finally(() => {
        this.isLoading = false;
      });

    // 10. 真實 API 呼叫寫法 (需取消註解)
    // this.apiService.createTransferRaw(payload)
    //   .then(resp => {
    //     const result = resp.data; // 取出後端 JSON
    //     if (result.code === 0) {
    //       Swal.fire({
    //         icon: 'success',
    //         title: '轉帳成功',
    //         text: '轉帳成功！ID: ' + result.data.id,
    //         confirmButtonText: '確定'
    //       }).then(() => {
    //         this.resetForm();
    //       });
    //     } else {
    //       Swal.fire({
    //         icon: 'error',
    //         title: '轉帳失敗',
    //         text: result.message,
    //         confirmButtonText: '確定'
    //       });
    //     }
    //   })
    //   .catch(() => {
    //     Swal.fire({
    //       icon: 'error',
    //       title: '轉帳失敗',
    //       text: '伺服器或網路錯誤',
    //       confirmButtonText: '確定'
    //     });
    //   })
    //   .finally(() => { this.isLoading = false; });
  }

  // 重置表單的邏輯
  resetForm() {
    this.fromAccountId = 0;
    this.toAccountId = 0;
    this.transferDateString = new Date().toISOString().split('T')[0];
    this.amount = 0;
    this.fee = undefined;
    this.description = undefined;
    this.isLoading = false;

    // 重置 NgModel 的狀態，清除 touched 和 dirty
    // 這裡使用 setTimeout 是因為 NgModel 的重置可能需要一個微任務延遲
    setTimeout(() => {
      this.transferDateField.control.markAsUntouched();
      this.transferDateField.control.markAsPristine();
      this.fromAccountField.control.markAsUntouched();
      this.fromAccountField.control.markAsPristine();
      this.toAccountField.control.markAsUntouched();
      this.toAccountField.control.markAsPristine();
      this.amountField.control.markAsUntouched();
      this.amountField.control.markAsPristine();
      this.feeField.control.markAsUntouched();
      this.feeField.control.markAsPristine();
      this.descriptionField.control.markAsUntouched();
      this.descriptionField.control.markAsPristine();
    });
  }
  // 回首頁
  onCancel() {
    this.router.navigate(['/home']);
  }

  toggleToAccount(id: number) {
    this.toAccountId === id ? this.toAccountId = 0 : this.toAccountId = id;
  }
}
