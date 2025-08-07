import { BudgetInfo } from "../budgetInfo";
import { BasicResponse } from "./basicResponse";
/**
 * 根據帳號查詢預算資料的回應格式
 */
export interface GetBudgetByAccountResponse extends BasicResponse {
  /**
   * 各帳戶對應的預算資料清單
   */
  budgetList: BudgetInfo[];
}
