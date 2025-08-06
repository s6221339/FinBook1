import { AuthService } from './../../@services/auth.service';
import { ApiService } from './../../@services/api.service';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Transfer } from '../../models/transfer';
import { BalanceInfo } from '../../models/balanceInfo';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CustomPaginatorComponent } from '../custom-paginator/custom-paginator.component';
import { CommonModule } from '@angular/common';

export interface TransferDisplayItem {
  transfersId: number;
  fromName: string;
  amount: number;
  description: string;
  createDate: string;
  selectedBalanceId: number | null;
}

@Component({
  selector: 'app-transfer-target-selection-page',
  imports: [
    FormsModule,
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatCardModule,
    CustomPaginatorComponent
  ],
  templateUrl: './transfer-target-selection-page.component.html',
  standalone: true,
  styleUrl: './transfer-target-selection-page.component.scss'
})
export class TransferTargetSelectionPageComponent implements OnInit{

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  displayedColumns: string[] = ['fromName', 'amount', 'description', 'createDate', 'selectAccount', 'actions'];
  dataSource = new MatTableDataSource<TransferDisplayItem>([]);
  balanceList: BalanceInfo[] = [];

  pageSize = 5;
  currentPage = 1;

  async ngOnInit() {
    const account = this.authService.getCurrentUser()?.account;
    if(!account) return;

    //  載入帳戶清單
    const balanceRes = await this.apiService.getBalanceByAccount(account);
    if(balanceRes.data.code == 200) {
      this.balanceList = balanceRes.data.balanceList;
    }

    await this.refreshData();
  }

  async refreshData() {
    const transferRes = await this.apiService.getUnconfirmedTransfer();
    if(transferRes.data.code == 200) {
      const rawTransfers = transferRes.data.transfersList;
      const displayData: TransferDisplayItem[] = [];

      for(const transfer of rawTransfers) {
        const nameRes = await this.apiService.getNameByAccount(transfer.fromAccount);
        const fromName = nameRes.data.memberData?.name || transfer.fromAccount;

        displayData.push({
          transfersId: transfer.transfersId,
          fromName: fromName,
          amount: transfer.amount,
          description: transfer.description,
          createDate: transfer.createDate,
          selectedBalanceId: null
        });
      }
      this.dataSource.data = displayData;
      this.currentPage = 1;
    }
  }

  get pagedData(): TransferDisplayItem[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.dataSource.data.slice(startIndex, startIndex + this.pageSize);
  }

  get totalRecords(): number {
    return this.dataSource.data.length;
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  //  機受額度轉移
  async accept(element: TransferDisplayItem) {
    if(element.selectedBalanceId == null) {
      Swal.fire('請先選擇帳戶', '請選擇您要匯入的帳戶', 'warning');
      return;
    }

    const res = await this.apiService.acceptTransfer(element.transfersId, element.selectedBalanceId);
    if(res.data.code == 200) {
      Swal.fire('接受成功', '您已成功接受這筆額度轉移', 'success')
        .then(() => this.refreshData());
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
        .then(() => this.refreshData());
    }
    else {
      Swal.fire('拒絕失敗', res.data.message || '發生未知錯誤', 'error');
    }
  }

}
