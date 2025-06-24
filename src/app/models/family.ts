import { FamilyMember } from "./familyMember";

//  家庭資料的 interface
export interface Family {
  id: number;
  name: string;
  owner: FamilyMember;
  memberList: FamilyMember[] | [];
}
