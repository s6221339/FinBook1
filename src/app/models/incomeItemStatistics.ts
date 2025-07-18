import { PaymentTypeInfo } from "./paymentTypeInfo";

//  所有帳戶單月收入細項資料的 interface
export interface IncomeItemStatistics {
  year: number;
  month: number;
  paymentTypeInfoList: PaymentTypeInfo[];
}
