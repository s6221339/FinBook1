import { AuthService } from './../../@services/auth.service';
import { ApiService } from './../../@services/api.service';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Transfer } from '../../models/transfer';
import { BalanceInfo } from '../../models/balanceInfo';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transfer-target-selection-page',
  imports: [FormsModule],
  templateUrl: './transfer-target-selection-page.component.html',
  standalone: true,
  styleUrl: './transfer-target-selection-page.component.scss'
})
export class TransferTargetSelectionPageComponent implements OnInit{

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  transferList: Transfer[] = [];
  balanceList: BalanceInfo[] = [];
  transferDisplayDate: {
    transfer: Transfer;
    fromName: string;
    fromAvatar: string;
    selectedBalanceId: number | null;
  }[] = [];

  defaultAvatar: string = '/defaultavatar.jpg';

  async ngOnInit() {
    const account = this.authService.getCurrentUser()?.account;
    if(!account) return;

    //  載入帳戶清單
    const balanceRes = await this.apiService.getBalanceByAccount(account);
    if(balanceRes.data.code == 200) {
      this.balanceList = balanceRes.data.balanceList;
    }

    //  載入轉移資料
    const transferRes = await this.apiService.getUnconfirmedTransfer();
    if(transferRes.data.code == 200) {
      const rawTransfers = transferRes.data.transfersList;

      for(const transfer of rawTransfers) {
        const nameRes = await this.apiService.getNameByAccount(transfer.fromAccount);
        const fromName = nameRes.data.memberData?.name || transfer.fromAccount;
        const fromAvatar = nameRes.data.memberData?.avatar || this.defaultAvatar;

        this.transferDisplayDate.push({
          transfer,
          fromName,
          fromAvatar,
          selectedBalanceId: null
        });
      }
    }
  }

  //  機受額度轉移
  async accept(tId: number, selectedBalanceId: number | null) {
    if(selectedBalanceId == null) {
      Swal.fire('請先選擇帳戶', '請選擇您要匯入的帳戶', 'warning');
      return;
    }

    const res = await this.apiService.acceptTransfer(tId, selectedBalanceId);
    if(res.data.code == 200) {
      Swal.fire('接受成功', '您已成功接受這筆額度轉移', 'success')
        .then(() => window.location.reload());
    }
    else {
      Swal.fire('接受失敗', res.data.message || '發生未知錯誤', 'error');
    }
  }

  //  拒絕額度轉移
  async reject(tId: number) {
    const res = await this.apiService.rejectTransfer(tId);
    if(res.data.code == 200) {
      Swal.fire('已拒絕轉帳', '該筆轉帳已被您取消', 'success')
        .then(() => window.location.reload());
    }
    else {
      Swal.fire('拒絕失敗', res.data.message || '發生未知錯誤', 'error');
    }
  }

}
