import { PaymentInfos } from './PaymentInfos';
/**
 * 帳戶與其所有帳款資訊
 */
export interface BalanceWithPayment {
  /**
   * 帳戶 ID （balance 表主鍵）
   */
  balanceId: number;

  /**
   * 此帳戶下的所有帳款資訊
   */
  paymentInfoList: PaymentInfos[];
}
