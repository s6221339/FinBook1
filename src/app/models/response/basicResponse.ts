/**
 * API基本回覆回傳格式
 */
export interface BasicResponse {
  /**
   * 回傳狀態碼（成功 200）
   */
  code: number;

  /**
   * 提示訊息
   */
  message: string;
}
