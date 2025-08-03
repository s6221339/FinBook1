/**
 * AI 分析資料回傳內容
 */
export interface AIAnalysisItem {
  /**
   * 年度（資料對應年份）
   */
  year: number;
  /**
   * 月份（資料對應月份）
   */
  month: number;
  /**
   * 分析文字結果
   */
  analysis: string;
}
