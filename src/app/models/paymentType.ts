/**
 * 單筆帳款類型語細項
 */
export interface PaymentType {
  /**
   * 類型名稱（如：交通、娛樂）
   */
  type: string;

  /**
   * 細項名稱（如：捷運、電影）
   */
  item: string;
}
