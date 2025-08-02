import { Family } from "../family";
import { BasicResponse } from "./basicResponse";

/**
 * 根據會員帳號查詢其所屬家庭的回應格式
 */
export interface GetFamilyByAccountResponse extends BasicResponse {
  /**
   * 家庭清單，每個家庭包含群組基本資訊與成員資料
   */
  familyList: Family[];
}
