import { PaymentInfo } from "./paymentInfo";

//  每月各類別帳款統計資料的interface
export interface MonthlyStatistics {
  year: number;
  month: number;
  paymentInfo: PaymentInfo[];
}
