import {Component} from '@angular/core';
import {MAT_DATE_LOCALE, provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { registerLocaleData } from '@angular/common';
import localeZh from '@angular/common/locales/zh';
import { FormsModule } from '@angular/forms';
import { Account, TransferRequest } from '../../models/transfers';
import { ApiService } from '../../@services/api.service';
import Swal from 'sweetalert2';
registerLocaleData(localeZh, 'zh-TW');

@Component({
  selector: 'app-transfers',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    MatSelectModule,
    FormsModule
  ],
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'zh-TW' }
],
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.scss'
})
export class TransfersComponent {

  constructor(private apiService: ApiService) {}

   // 1. 宣告對應 HTML 表單欄位的屬性
  fromAccountId: number = 0;   // 轉出子帳戶 ID
  toAccountId:   number = 0;   // 轉入子帳戶 ID
  transferDate:  Date | null = null;  // 選擇的日期 (Material Datepicker 回傳 Date)
  amount:        number = 0;   // 轉帳金額
  fee?:          number;       // 手續費，可選
  description?:  string;       // 備註，可選

  // 2. 表單狀態與錯誤提示
  accounts: Account[] = [];    // 帳戶清單
  isLoading: boolean  = false; // 是否正在執行轉帳，用於按鈕禁用


  // 3. 載入完成後的初始化
  ngOnInit() {
    // A. 假資料測試：先給三個帳戶來渲染下拉選單
    this.accounts = [
      { id: 1, name: '現金',    balance: 10000 },
      { id: 2, name: '銀行儲蓄', balance: 25000 },
      { id: 3, name: '信用卡',   balance: -5000 }
    ];

    // B. 若要使用真實 API，取消註解下面這段
    // this.apiService.getAccountsRaw()
    //   .then(resp => {
    //     // resp.data 是後端回傳的 JSON 陣列
    //     this.accounts = resp.data;
    //   })
    //   .catch(() => {
    //     this.errorMsg = '無法取得帳戶清單';
    //   });
  }

  /**
   * 使用者按下「確認轉帳」時呼叫
   */
  onSubmit() {
    // 4. 前端基本驗證：
    // 驗證轉帳日期是否填寫
      if (!this.transferDate) {
        Swal.fire({
          icon: 'error',
          title: '日期錯誤',
          text: '請選擇轉帳日期。',
          confirmButtonText: '確定'
        });
        return;
      }

      // 驗證來源帳戶是否正確
      if (this.fromAccountId <= 0) {
        Swal.fire({
          icon: 'error',
          title: '轉出帳戶錯誤',
          text: '請選擇有效的轉出子帳戶。',
          confirmButtonText: '確定'
        });
        return;
      }

      // 驗證目的帳戶是否正確
      if (this.toAccountId <= 0) {
        Swal.fire({
          icon: 'error',
          title: '轉入帳戶錯誤',
          text: '請選擇有效的轉入子帳戶。',
          confirmButtonText: '確定'
        });
        return;
      }

      // 驗證金額是否大於 0
      if (this.amount <= 0) {
        Swal.fire({
          icon: 'error',
          title: '金額錯誤',
          text: '請輸入大於 0 的金額。',
          confirmButtonText: '確定'
        });
        return;
      }

      // 若 fee 為空值，設定預設值 0
      if (this.fee === undefined || this.fee === null) {
        this.fee = 0;
      }

      // 如果 fee < 0 就中斷
      if (this.fee < 0) {
        Swal.fire({
          icon: 'error',
          title: '手續費錯誤',
          text: '手續費不能為負數。',
          confirmButtonText: '確定'
        });
        return;
      }

    // 5. 清除錯誤訊息並顯示載入狀態
    this.isLoading = true;

    // 6. 將 Date 物件格式化為 "YYYY-MM-DD" 字串
    const dateObj: Date = this.transferDate!;  // 非空斷言，保證有值
    const yyyy = dateObj.getFullYear();
    const mm   = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd   = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    // 7. 組合成 transferRequest 物件，符合後端要求的欄位
    const payload: TransferRequest = {
      fromAccountId: this.fromAccountId,
      toAccountId:   this.toAccountId,
      transferDate:  dateStr,
      amount:        this.amount,
      fee:           this.fee,
      description:   this.description
    };

    // 8. 測試用：印出 payload，確認組合正確
    console.log('測試用 payload:', payload);

    // 9. 假呼叫替代後端，模擬異步行為
    new Promise<void>(res => setTimeout(res, 500))
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: '轉帳成功',
          text: '假轉帳完成！',
          confirmButtonText: '確定'
        }).then(() => {
          // 成功後重置表單
          this.resetForm();
        });
      })

      .catch(() => {
        Swal.fire({
        icon: 'error',
        title: '欄位錯誤',
        text: '請填寫所有必填欄位，且金額需大於 0',
        confirmButtonText: '確定'
        });
      })
      .finally(() => {
        // 無論成功或錯誤，都關閉載入狀態
        this.isLoading = false;
      });

    // 10. 真實 API 呼叫寫法 (需取消註解)
  //   this.apiService.createTransferRaw(payload)
  //     .then(resp => {
  //       const result = resp.data; // 取出後端 JSON
  //       if (result.code === 0) {
  //         Swal.fire({
  //           icon: 'success',
  //           title: '轉帳成功',
  //           text: '轉帳成功！ID: ' + result.data.id,
  //           confirmButtonText: '確定'
  //         }).then(() => {
  //           this.resetForm();
  //         });
  //       }else {
  //         Swal.fire({
  //           icon: 'error',
  //           title: '轉帳失敗',
  //           text: result.message,
  //           confirmButtonText: '確定'
  //           });
  //         }
  //         })
  //     .catch(() => {
  //         Swal.fire({
  //          icon: 'error',
  //          title: '轉帳失敗',
  //          text: '伺服器或網路錯誤',
  //          confirmButtonText: '確定'
  //           });
  //         })
  //     .finally(() => { this.isLoading = false; });
   }

  /**
   * 按下「取消」時清空表單與錯誤訊息
   */
  onCancel() {
    this.resetForm();

  }

  /**
   * 單欄位重置邏輯
   */
  private resetForm() {
    this.fromAccountId = 0;
    this.toAccountId   = 0;
    this.transferDate  = null;
    this.amount        = 0;
    this.fee           = undefined;
    this.description   = undefined;
  }
}
