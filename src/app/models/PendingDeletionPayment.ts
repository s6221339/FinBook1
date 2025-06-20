//  待刪區帳款資料的interface
export interface PendingDeletionPayment {
  balanceId: number,
  paymentInfoList:[
    {
      paymentId: number,
      description: string,
      type: string,
      item: string,
      amount: number,
      recurringPeriod: {
        year: number,
        month: number,
        day: number
      },
      recordDate: Date,
      lifeTime: number
    }
  ]
}
