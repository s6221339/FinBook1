//  編輯會員資料的interface
export interface UserVO {
  account: string;
  name: string;
  phone: string;
  birthday: string;
  avatar: string | null;
  role: 'admin' | 'user'
}
