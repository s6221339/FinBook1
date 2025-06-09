import { Component } from '@angular/core';
import { Subscription } from 'rxjs'; // 導入 Subscription 用於管理訂閱
import { MemberdataService, MemberData } from '../../@services/memberdata.service'; // 導入服務和介面
import { Router } from '@angular/router';

@Component({
  selector: 'app-member-confirm',
  imports: [],
  standalone:true,
  templateUrl: './member-confirm.component.html',
  styleUrl: './member-confirm.component.scss'
})
export class MemberConfirmComponent {
     memberData: MemberData | undefined; // 用於儲存從服務接收到的資料
  private memberDataSubscription!: Subscription; // 用於儲存訂閱，以便在元件銷毀時取消訂閱

  constructor(private memberdataService: MemberdataService,private router:Router) { }

  ngOnInit(): void {
    // 訂閱服務中的資料
    this.memberDataSubscription = this.memberdataService.currentMemberData.subscribe(
      data => {
        this.memberData = data;
        console.log('MemberConfirmComponent 接收到資料:', this.memberData);
      }
    );
  }

  ngOnDestroy(): void {
    // 在元件銷毀時取消訂閱，防止記憶體洩漏
    if (this.memberDataSubscription) {
      this.memberDataSubscription.unsubscribe();
    }
  }

  goToEdit(){
     console.log('返回編輯按鈕被點擊了！');
    this.router.navigate(['/memberCenter/memberInfo']); // 使用 router.navigate() 導航
  }
}
