import { AIQueryDate } from "../AIQueryDate";
/**
 * 查詢 AI 分析資料的請求格式
 *
 * from：起始時間，to：結束時間
 *
 * 需登入：需附帶 Cookie 或驗證資訊
 *
 * 對應 API: POST /finbook/aiQueryLogs/getAnalysis
 */
export interface GetAIAnalysisRequest {
  /**
   * 分析資料起始查詢時間
   */
  from: AIQueryDate;
  /**
   * 分析資料結束查詢時間
   */
  to: AIQueryDate;
}
