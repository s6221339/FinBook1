import { AmountDetail } from "./amountDetail";

//  每月各類別帳款資料的interface
export interface PaymentTypeInfo {
  type: string;
  amountDetailList: AmountDetail[];
}
