import { MemberData } from "../memberData";
import { BasicResponse } from "./basicResponse";
/**
 * 根據帳號取得會員名稱的回應格式
 */
export interface getNameByAccountResponse extends BasicResponse {
  /**
   * 會員資料物件
   */
  memberData: MemberData;
}
