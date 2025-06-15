//  帳戶資料的interface
export interface Balance {
  balanceId: number;
  familyId: number;
  account: string | null;
  name: string;
  createDate: string;
}
