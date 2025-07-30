import { PaymentType } from "../paymentType";
import { BasicResponse } from "./basicResponse";

/**
 * 根據帳號取得帳款類型資料的回應格式
 */
export interface GetPaymentTypeByAccountResponse extends BasicResponse{
  /**
   * 帳款類型與項目清單
   */
  paymentTypeList: PaymentType[];
}
