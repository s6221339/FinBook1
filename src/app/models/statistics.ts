import { IncomeAndOutlayInfoVO } from "./incomeAndOutlayInfoVO";

//  所有帳戶單月收支資料的 interface
export interface Statistics {
  year: number;
  month: number;
  incomeAndOutlayInfoVOList: IncomeAndOutlayInfoVO[];
}
