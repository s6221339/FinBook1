import { PaymentInfos } from "./PaymentInfos";

//  待刪區帳款資料的 interface 並用家庭帳款資料的 interface
export interface PendingDeletionPayment {
  balanceId: number;
  paymentInfoList: PaymentInfos[];
}
