/**
 * 單筆帳戶的預算設計資料
 */
export interface BudgetInfo {
  /**
   * 帳戶 ID
   */
  balanceId: number;

  /**
   * 實際餘額 = 預計本月可用金額 + 本月總收入 - 本月總支出
   */
  settlement: number;

  /**
   * 預計本月可用金額 = 循環收入 - 循環支出 - 儲蓄
   */
  budget: number;

  /**
   * 循環收入
   */
  recurIncome: number;

  /**
   * 循環支出
   */
  recurExpenditure: number;

  /**
   * 本月總收入
   */
  income: number;

  /**
   * 本月總支出
   */
  expenditure: number;
}
