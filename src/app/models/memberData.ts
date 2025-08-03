/**
 * 會員基本資料
 */
export interface MemberData {
  /**
   * 會員帳號
   */
  account: string;

  /**
   * 會員名稱
   */
  name: string;

  /**
   * 大頭貼網址 base64
   */
  avatar: string;
}
