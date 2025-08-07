/**
 * 根據帳號與年月查詢預算資料的請求格式
 *
 * 需登入：需附帶 Cookie 或驗證資訊
 *
 * 對應 API: POST /finbook/balance/getBudgetByAccount
 */
export interface GetBudgetByAccountRequest {
  /**
   * 使用者帳號
   */
  account: string;

  /**
   * 查詢的年份（例如：2025）
   */
  year: number;

  /**
   * 查詢的月份（1~12）
   */
  month: number;
}
