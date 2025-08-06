/**
 * 單筆帳款資訊
 */
export interface PaymentInfos {
      /**
       * 帳款 ID
       */
      paymentId: number;

      /**
       * 帳款描述
       */
      description: string;

      /**
       * 帳款類型（如：飲食、交通）
       */
      type: string;

      /**
       * 帳款細項（如：便當、捷運）
       */
      item: string;

      /**
       * 金額（須為正整數）
       */
      amount: number;

      /**
       * 循環週期（年/月/日）
       */
      recurringPeriod: {
        /**
         * 循環週期 - 年
         */
        year: number;

        /**
         * 循環週期 - 月
         */
        month: number;

        /**
         * 循環週期 - 日
         */
        day: number;
      };

      /**
       * 紀錄日期（yyyy-MM-dd）
       */
      recordDate: string;

      /**
       * 有效天數（從記錄日起算計算的壽命天數）
       */
      lifeTime: number;
}
