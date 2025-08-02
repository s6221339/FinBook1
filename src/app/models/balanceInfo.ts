/**
 * 單筆帳戶資料
 */
export interface BalanceInfo {
  /**
   * 帳戶 ID （流水號主鍵）
   */
  balanceId: number;

  /**
   * 所屬家庭 ID ，若為個人帳戶則為 0
   */
  familyId: number;

  /**
   * 擁有者帳號（個人帳戶為 email，家庭帳戶為 null）
   */
  account: string | null;

  /**
   * 帳戶名稱
   */
  name: string;

  /**
   * 帳戶建立日期（yyyy-MM-dd 格式）
   */
  createDate: string;
}
