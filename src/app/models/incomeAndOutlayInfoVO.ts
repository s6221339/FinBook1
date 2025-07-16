//  單個帳戶單個月帳戶收支資料的 interface
export interface IncomeAndOutlayInfoVO {
  balanceInfo: {
    id: number;
    name: string
  };
  familyInfo: number | null;
  income: number;
  outlay: number;
}
