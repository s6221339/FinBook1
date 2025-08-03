import { AIAnalysisItem } from "../AIAnalysisItem";
import { BasicResponse } from "./basicResponse";
/**
 * 取得 AI 分析結果 API 回應格式
 */
export interface GetAIAnalysisResponse extends BasicResponse {
  /**
   * 分析內容清單（可能為空陣列）
   */
  analysisList: AIAnalysisItem[];
}
