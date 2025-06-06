//  保留帳款填寫資料的interface
export interface PaymentFormData {
  recordDate: Date;
  recurringPeriodYear: number | null;
  recurringPeriodMonth: number | null;
  recurringPeriodDay: number | null;
  selectedUserName: string;
  amount: number | null;
  selectedType: string | null;
  selectedItem: string | null;
  description: string | '';
}
