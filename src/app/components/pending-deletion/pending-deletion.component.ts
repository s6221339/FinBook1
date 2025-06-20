import { MatFormFieldModule } from '@angular/material/form-field';
import { Balance } from '../../models/Balance';
import { PendingDeletionPayment } from '../../models/PendingDeletionPayment';
import { ApiService } from './../../@services/api.service';
import { Component, OnInit } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-pending-deletion',
  imports: [MatFormFieldModule, MatSelectModule, FormsModule, MatOptionModule, MatInputModule, MatDatepickerModule],
  templateUrl: './pending-deletion.component.html',
  styleUrl: './pending-deletion.component.scss'
})
export class PendingDeletionComponent implements OnInit{

  constructor(
    private apiService: ApiService
  ){}

  account: string= 'a6221339';
  balances: Balance[] = [];
  selectedBalanceId: number | null = null;
  pendingList: PendingDeletionPayment[] = [];
  filteredPayments: any[] = [];
  isAllSelected: boolean = false;

  ngOnInit(): void {
    this.apiService.getBalanceByAccount(this.account)
    .then(res => {
      this.balances = res.data.balanceList || [];
      if(this.balances.length > 0) {
        this.selectedBalanceId = this.balances[0].balanceId;
        this.loadPayments();
      }
    })
    .catch(err => {
      console.error('載入帳戶失敗', err);
      alert('帳戶資料載入失敗，請稍後再試');
    });
  }

  loadPayments(): void {
    this.apiService.getPaymentInPendingDeletion(this.account)
    .then(res => {
      this.pendingList = res.data.balanceWithPaymentList || [];
      this.filterByBalanceId();
    })
    .catch(err => {
      console.error('取得待刪除資料失敗', err);
      alert('待刪除帳款資料載入失敗，請稍後再試');
    });
  }

  filterByBalanceId(): void {
    const matched = this.pendingList.find(p => p.balanceId == this.selectedBalanceId);
    this.filteredPayments = matched?.paymentInfoList.filter(p => p.lifeTime >= 0) || [];
  }

  onBalanceChange(){
    this.filterByBalanceId();
  }

  //  切換全選/取消全選
  toggleSelectAll(): void {
    this.isAllSelected = !this.isAllSelected;
    this.filteredPayments.forEach(p => p.selected = this.isAllSelected);
  }

  //  復原勾選項目
  recoverSelectedPayments(): void {
    const selected = this.filteredPayments.filter(p => p.selected);
    if(selected.length == 0) {
      alert('請先選擇要復原的資料');
      return;
    }

    const ids = selected.map(p => p.paymentId);
    this.apiService.recoveryPayments(ids)
    .then(res => {
      alert('✅ 復原成功');
      this.loadPayments();
    })
    .catch(err => {
      console.error('復原失敗', err);
      alert('❌ 復原失敗，請稍後再試');
    });
  }

  //  同步 isAllSelected 狀態
  updateSelectAllState(): void {
    this.isAllSelected = this.filteredPayments.every(p => p.selected);
  }

}
