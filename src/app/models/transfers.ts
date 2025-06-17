
/** 前端要送給後端的轉帳資料 */
export interface TransferRequest {
  fromBalance: number;
  toBalance:   number;
  amount:        number;
  description?:  string;   // 可選
  // transferDate:  string;   // 格式 "YYYY-MM-DD"
}

/** 後端儲存並回傳的轉帳紀錄 */
export interface Transfer {
  transfersId: number;
  createDate: string;
  fromBalanceId: number;
  toBalanceId: number;
  amount: number;
  description: string;
}

/** 對應後端 BasicResponse<T>，包裝 code、message、data */
export interface ApiResponse<T = any> {
  code:    number;    // 後端回傳的狀態碼 (0 表示成功)
  message: string;    // 提示或錯誤訊息
  transfersList?: T;         // 成功時回傳的資料
}

//  帳戶資料的interface
export interface Account {
  balanceId: number;
  familyId: number;
  account: string | null;
  name: string;
  createDate: string;
}
