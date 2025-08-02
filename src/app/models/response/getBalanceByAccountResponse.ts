import { BalanceInfo } from "../balanceInfo";
import { BasicResponse } from "./basicResponse";

/**
 * 根據帳號取得帳戶資料的回應格式
 */
export interface GetBalanceByAccountResponse extends BasicResponse {
  /**
   * 該使用者所擁有的帳戶清單
   */
  balanceList: BalanceInfo[] | [];
}
