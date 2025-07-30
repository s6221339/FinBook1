/**
 * 創立帳款類型請求資料
 * 需登入：需附帶 Cookie 或驗證資訊
 * 對應 API: POST /finbook/paymentType/create
 */
export interface PaymentTypeCreateRequest {
  /**
   * 帳款類型（如交通、飲食）
   */
  type: string;

  /**
   * 帳款細項（如捷運、便當）
   */
  item: string;

  /**
   * 使用者帳號
   */
  account: string;
}
