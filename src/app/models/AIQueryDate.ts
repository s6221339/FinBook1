/**
 * AI 分析資料查詢的起迄時間結構
 */
export interface AIQueryDate {
  /**
   * 年（不可為 null，建議為 2001 以後的年份）
   */
  year: number;

  /**
   * 月（ 1 ~ 12 ）
   */
  month: number;

  /**
   * 日（可為 null 或具體日期）
   */
  day: number | null;
}
