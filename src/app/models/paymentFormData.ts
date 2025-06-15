//  保留帳款填寫資料的interface
export interface PaymentFormData {
  recordDate: Date;
  recurringPeriodYear: number | null;
  recurringPeriodMonth: number | null;
  recurringPeriodDay: number | null;
  selectedBalanceId: number;
  amount: number | null;
  selectedType: string | null;
  selectedItem: string | null;
  description: string | '';
}
