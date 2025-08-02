/**
 * 單筆額度轉移資料
 */
export interface Transfer {
  /**
   * 轉移 ID（流水號）
   */
  transfersId: number;

  /**
   * 轉出帳號（發起者帳號）
   */
  fromAccount: string;

  /**
   * 轉出帳戶 ID（對應 balance）
   */
  fromBalanceId: number;

  /**
   * 轉入帳號
   */
  toAccount: string;

  /**
   * 轉入帳戶 ID（對應 balance）
   */
  toBalanceId: number;

  /**
   * 轉帳金額
   */
  amount: number;

  /**
   * 備註說明
   */
  description: string;

  /**
   * 建立日期（轉帳日期）
   */
  createDate: string; //  格式為 'YYYY-MM-DD'
}
