//  編輯帳款資料的interface
export interface PaymentIdFormData {
  paymentId: number;
  type: string | null;
  item: string | null;
  description: string | '';
  amount: number | null;
  recurringPeriodYear: number | null;
  recurringPeriodMonth: number | null;
  recurringPeriodDay: number | null;
  recordDate: Date;
}
