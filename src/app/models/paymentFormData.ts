//  保留帳款填寫資料的interface
export interface PaymentFormData {
  date: Date;
  selectedUserName: string;
  amount: number | null;
  selectedType: string | null;
  selectedItem: string | null;
  description: string | '';
}
