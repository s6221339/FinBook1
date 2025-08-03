import { TransferRecord } from "../transferRecord";
import { BasicResponse } from "./basicResponse";

/**
 * 根據帳戶取得轉帳紀錄的回應格式
 */
export interface GetAllTransfersResponse extends BasicResponse {
  /**
   * 該帳戶所有轉帳紀錄清單
   */
  transfersList: TransferRecord[];
}
