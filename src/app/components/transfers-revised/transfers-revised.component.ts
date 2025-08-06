import { AuthService } from './../../@services/auth.service';
import { ApiService } from './../../@services/api.service';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { BalanceInfo } from '../../models/balanceInfo';
import { FamilyMember } from '../../models/familyMember';
import { Router } from '@angular/router';
import { CreateTransferRequest } from '../../models/request/createTransferRequest';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-transfers-revised',
  imports: [
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './transfers-revised.component.html',
  styleUrl: './transfers-revised.component.scss',
  standalone: true,
})
export class TransfersRevisedComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  balanceList: BalanceInfo[] = [];
  familyMemberList: FamilyMember[] = [];
  //  預設大頭貼
  defaultAvatar: string = '/defaultavatar.jpg';

  transferData: CreateTransferRequest = {
    fromBalance: null,
    toAccount: null,
    amount: null,
    description: ''
  };

  ngOnInit(): void {
    const account = this.authService.getCurrentUser()?.account;
    if(!account) return;

    //  取得轉出帳戶
    this.apiService.getBalanceByAccount(account)
      .then(res => {
        if(res.data.code == 200) {
          this.balanceList = res.data.balanceList;
        }
      });

      //  取得轉入帳號（家庭成員清單）
      this.apiService.getFamilyByAccount(account)
        .then(res => {
          const allMembers: FamilyMember[] = [];

          res.data.familyList.forEach(family => {
            allMembers.push(family.owner);
            allMembers.push(...family.memberList);
          });

          //  排除重複帳號
          const uniqueMap = new Map<string, FamilyMember>();
          allMembers.forEach(m => {
            if(!uniqueMap.has(m.account)) {
              uniqueMap.set(m.account, m);
            }
          });

          this.familyMemberList = Array.from(uniqueMap.values());
        });
  }

  submitTransfer(): void {
    if (
      !this.transferData.fromBalance ||
      !this.transferData.toAccount ||
      this.transferData.amount === null ||
      !Number.isInteger(this.transferData.amount) ||
      this.transferData.amount <= 0
    ) {
      Swal.fire('資料不完整', '請填寫所有欄位並輸入正確金額（整數且大於 0）', 'warning');
      return;
    }

    this.apiService.createTransfers(this.transferData)
      .then(res => {
        if(res.data.code == 200) {
          Swal.fire('轉帳成功', '額度已成功轉移', 'success');
          this.transferData = {
            fromBalance: null,
            toAccount: null,
            amount: null,
            description: ''
          };
        }
        else {
          Swal.fire('轉帳失敗', res.data.message, 'error');
        }
      })
      .catch(err => {
        console.error("額度轉移失敗", err);
        Swal.fire('系統錯誤', '無法完成轉帳，請稍後再試', 'error');
      });
  }

  cancel(): void {
    this.router.navigate(['/home']);
  }

}
