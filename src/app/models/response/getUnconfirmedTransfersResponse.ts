import { Transfer } from "../transfer";
import { BasicResponse } from "./basicResponse";

/**
 * 取得未確認額度轉移 API 回傳格式
 */
export interface GetUnconfirmedTransfersResponse extends BasicResponse{
  /**
   * 未確認額度轉移清單
   */
  transfersList: Transfer[];
}
