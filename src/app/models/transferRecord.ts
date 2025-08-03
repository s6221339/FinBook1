/**
 * 單筆轉帳紀錄
 */
export interface TransferRecord {
  /**
   * 轉帳紀錄 ID
   */
  transfersId: number;

  /**
   * 轉出帳號
   */
  fromAccount: string;

  /**
   * 轉出帳戶 ID
   */
  fromBalanceId: number;

  /**
   * 轉入帳號
   */
  toAccount: string;

  /**
   * 轉入帳戶 ID
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
   * 建立日期
   */
  createDate: string; //  e.g., '2025-08-03'
}
