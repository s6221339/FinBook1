/**
 * 新增帳款請求資料結構
 * 需登入：需附帶 Cookie 或驗證資訊
 * 對應 API: POST /finbook/payment/create
 */
export interface PaymentCreateRequest {
  /**
   * 所屬帳戶 ID（balance_id）
   */
  balanceId: number;

  /**
   * 帳款描述（可為空）
   */
  description: string | null;

  /**
   * 類別（如：飲食、交通）
   */
  type: string;

  /**
   * 細項（如：便當、捷運）
   */
  item: string;

  /**
   * 金額（需為正整數）
   */
  amount: number;

  /**
   * 循環週期（預設為 0 表示無循環）
   */
  recurringPeriod: {
    /**
     * 每幾年循環一次
     */
    year: number;

    /**
     * 每幾月循環一次
     */
    month: number;

    /**
     * 每幾天循環一次
     */
    day: number;
  };

  /**
   * 記帳日期（格式：YYYY-MM-DD）
   */
  recordDate: string;
}
