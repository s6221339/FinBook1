/**
 * 家庭成員資訊
 */
export interface FamilyMember {
  /**
   * 家庭帳號（user.account）
   */
  account: string;

  /**
   * 會員名稱（user.name）
   */
  name: string;

  /**
   * 大頭貼圖示（base64 或 URL）
   */
  avatar: string | null;
}
