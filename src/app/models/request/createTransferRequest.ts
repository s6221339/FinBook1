/**
 * 建立額度轉移請求資料
 * 需登入：需附帶 Cookie 或驗證資訊
 * 對應 API：POST /finbook/transfers/create
 */
export interface CreateTransferRequest {
  /**
   * 來源帳戶 balanceId 須為當前登入會員所擁有
   */
  fromBalance: number | null;

  /**
   * 接收者帳號，需與使用者同個家庭
   */
  toAccount: string | null;

  /**
   * 轉帳金額，單位為元
   */
  amount: number | null;

  /**
   * 備註說明，可選填
   */
  description: string | null;
}
