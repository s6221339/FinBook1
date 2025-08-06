import { AuthService } from './../../@services/auth.service';
import { ApiService } from './../../@services/api.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BalanceInfo } from '../../models/balanceInfo';
import { TransferRecord } from '../../models/transferRecord';
import { MemberData } from '../../models/memberData';
import { NgClass, CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CustomPaginatorComponent } from '../custom-paginator/custom-paginator.component';

@Component({
  selector: 'app-transfer-record',
  standalone: true,
  templateUrl: './transfer-record.component.html',
  styleUrl: './transfer-record.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatCardModule,
    CustomPaginatorComponent
  ]
})
export class TransferRecordComponent implements OnInit {
  displayedColumns: string[] = ['rowIndex', 'createDate', 'fromBalanceId', 'toBalanceId', 'amount', 'description'];
  dataSource = new MatTableDataSource<TransferRecord>([]);
  @ViewChild(MatSort) sort!: MatSort;

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
        this.dataSource.data = this.filteredRecords;
        if (this.sort) {
          this.dataSource.sort = this.sort;
        }
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
    this.dataSource.data = this.filteredRecords;
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  // 移除自訂排序，改用 Material Table 內建排序

  // 分頁資料來源改用 dataSource
  get pagedRecords(): TransferRecord[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.dataSource.data.slice(startIndex, startIndex + this.pageSize);
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

  // 讓 template 可用 totalRecords
  get totalRecords(): number {
    return this.filteredRecords.length;
  }

  // 分頁事件處理
  onPageChange(page: number) {
    this.currentPage = page;
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  // 取得帳戶名稱（顯示名字與ID）
  getDisplayNameById(balanceId: number | null): string {
    if (!balanceId) return '';
    const found = this.balanceList.find((b: BalanceInfo) => b.balanceId === balanceId);
    return found ? `${found.name} (ID: ${found.balanceId})` : '';
  }
}
