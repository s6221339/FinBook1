//  帳款資料的 interface
export interface PaymentInfos {
      paymentId: number;
      description: string;
      type: string;
      item: string;
      amount: number;
      recurringPeriod: {
        year: number;
        month: number;
        day: number;
      };
      recordDate: string;
      lifeTime: number;
}
