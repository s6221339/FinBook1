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
  private memberDataSource = new BehaviorSubject<MemberData>({
    name: '我很帥',
    dobYear: new Date().getFullYear(),
    dobMonth: new Date().getMonth() + 1,
    dobDay: 1,
    phoneNumber: '0912345678'
  });

  // 對外仍然是 Observable
  currentMemberData: Observable<MemberData> = this.memberDataSource.asObservable();

  constructor() { }

  updateMemberData(data: MemberData) {
    this.memberDataSource.next(data);
  }

  clearMemberData() {
    this.memberDataSource.next({
      name: '',
      dobYear: null,
      dobMonth: null,
      dobDay: null,
      phoneNumber: ''
    });
  }

  // 🔥 重點：給 component 調用的 getValue() 方法
  getCurrentData(): MemberData {
    return this.memberDataSource.getValue();
  }
}
