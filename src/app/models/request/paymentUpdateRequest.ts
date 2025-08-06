/**
 * 更新帳款請求資料
 * 需登入：系統需附帶 cookie，否則將回傳 401
 * 對應 API: POST /finbook/payment/update
 */
export interface PaymentUpdateRequest {
  /**
   * 帳款 ID（資料庫主鍵，必選）
   */
  paymentId: number;

  /**
   * 帳款說明文字
   */
  description: string | null;

  /**
   * 帳款類型（如：飲食、交通）
   */
  type: string;

  /**
   * 帳款細項（如：早餐、捷運）
   */
  item: string;

  /**
   * 金額（須為正整數）
   */
  amount: number;

  /**
   * 循環週期資訊（年/月/日）
   */
  recurringPeriod: {
    /**
     * 循環週期 - 年
     */
    year: number;

    /**
     * 循環週期 - 月
     */
    month: number;

    /**
     * 循環週期 - 日
     */
    day: number;
  };

  /**
   * 記帳日期（yyyy-MM-dd）
   */
  recordDate: string;
}
