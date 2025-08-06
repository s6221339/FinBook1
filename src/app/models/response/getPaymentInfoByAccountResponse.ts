import { BalanceWithPayment } from "../balanceWithPayment";
import { BasicResponse } from "./basicResponse";
/**
 * 根據帳號查詢帳戶與帳款資訊的回傳格式
 */
export interface GetPaymentInfoByAccountResponse extends BasicResponse {
  /**
   * 帳戶及其對應的帳款清單
   */
  balanceWithPaymentList: BalanceWithPayment[];
}
