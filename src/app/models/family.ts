import { FamilyMember } from "./familyMember";

/**
 * 家庭基本資訊與成員清單
 */
export interface Family {
  /**
   * 家庭流水號 ID
   */
  id: number;

  /**
   * 家庭名稱
   */
  name: string;

  /**
   * 家庭擁有者資訊
   */
  owner: FamilyMember;

  /**
   * 家庭成員清單（不包含 owner）
   */
  memberList: FamilyMember[] | [];
}
