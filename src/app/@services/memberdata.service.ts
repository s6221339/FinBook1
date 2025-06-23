import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MemberData {
  name: string;
  dobYear: number | null;
  dobMonth: number | null;
  dobDay: number | null;
  phoneNumber: string;
}

@Injectable({
  providedIn: 'root'
})




export class MemberdataService {
  // BehaviorSubject 用於儲存資料並在資料更新時通知訂閱者
  // 初始值為 undefined 或一個空物件，視您的需求而定
  private memberDataSource = new BehaviorSubject<MemberData | undefined>(undefined);

  // 將資料作為 Observable 暴露出去，供其他元件訂閱
  currentMemberData: Observable<MemberData | undefined> = this.memberDataSource.asObservable();

  constructor() { }

  // 更新會員資料的方法
  updateMemberData(data: MemberData) {
    this.memberDataSource.next(data);
  }

  // 清除資料 (可選)
  clearMemberData() {
    this.memberDataSource.next(undefined);
  }


}
