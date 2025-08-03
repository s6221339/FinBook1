import { AuthService } from './../../@services/auth.service';
import { ApiService } from './../../@services/api.service';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BalanceInfo } from '../../models/balanceInfo';
import { TransferRecord } from '../../models/transferRecord';
import { MemberData } from '../../models/memberData';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-transfer-record',
  imports: [FormsModule, NgClass],
  templateUrl: './transfer-record.component.html',
  standalone: true,
  styleUrl: './transfer-record.component.scss'
})
export class TransferRecordComponent implements OnInit{

  constructor(
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  balanceList: BalanceInfo[] =[];
  selectedBalanceId: number | null = null;
  transferRecords: TransferRecord[] = [];
  filteredRecords: TransferRecord[] = [];
  fromInfoMap= new Map<string, MemberData>();
  toInfoMap = new Map<string, MemberData>();
  startDate: string = '';
  endDate: string = '';
  today = new Date().toISOString().split('T')[0]; //  yyyy-MM-dd

  pageSize = 5;
  currentPage = 1;
  sortKey: 'amount' | 'createDate' = 'createDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  ngOnInit(): void {
    const account = this.authService.getCurrentUser()?.account;
    if(!account) return;

    this.apiService.getBalanceByAccount(account)
      .then(res => {
        this.balanceList = res.data.balanceList || [];

        if(this.balanceList.length > 0) {
          this.selectedBalanceId = this.balanceList[0].balanceId;
          this.onBalanceChange();
        }
      });
  }

  onBalanceChange(): void {
    if(!this.selectedBalanceId) return;

    this.apiService.getAllTransfersByBalanceId(this.selectedBalanceId)
      .then(res => {
        this.transferRecords = res.data.transfersList || [];
        this.loadNamesForAllRecords(this.transferRecords);
        this.applyFilters();
      });
  }

  async loadNamesForAllRecords(records: TransferRecord[]) {
    for(const record of records) {
      if(!this.fromInfoMap.has(record.fromAccount)) {
        const fromRes = await this.apiService.getNameByAccount(record.fromAccount);
        this.fromInfoMap.set(record.fromAccount, fromRes.data.memberData);
      }

      if(!this.toInfoMap.has(record.toAccount)) {
        const toRes = await this.apiService.getNameByAccount(record.toAccount);
        this.toInfoMap.set(record.toAccount, toRes.data.memberData);
      }
    }
  }

  applyFilters() {
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;

    this.filteredRecords = this.transferRecords.filter(record => {
      const recordDate = new Date(record.createDate);
      return(!start || recordDate >= start) && (!end || recordDate <= end);
    });

    this.sortRecords();
  }

  sortRecords() {
    this.filteredRecords.sort((a, b) => {
      const aValue = this.sortKey == 'amount' ? a.amount : new Date(a.createDate).getTime();
      const bValue = this.sortKey == 'amount' ? b.amount : new Date(b.createDate).getTime();

      return this.sortDirection == 'asc' ? aValue - bValue : bValue - aValue;
    });
  }

  toggleSort(key: 'amount' | 'createDate') {
    if(this.sortKey == key) {
      this.sortDirection = this.sortDirection == 'asc' ? 'desc' : 'asc';
    }
    else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }

    this.sortRecords();
  }

  get pagedRecords(): TransferRecord[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredRecords.slice(startIndex, startIndex + this.pageSize);
  }

  getDisplayName(account: string): string {
    const info = this.fromInfoMap.get(account) || this.toInfoMap.get(account);
    return info ? info.name : account;
  }

  getAvatar(account: string): string {
    const info = this.fromInfoMap.get(account) || this.toInfoMap.get(account);
    return info ? info.avatar : '/defaultavatar.jpg';
  }

  isOutgoingFromSelectedAccount(record: TransferRecord): boolean {
    return record.fromBalanceId == this.selectedBalanceId;
  }

  isIncomingToSelectedAccount(record: TransferRecord): boolean {
    return record.toBalanceId == this.selectedBalanceId;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRecords.length / this.pageSize);
  }

}
