import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../@services/api.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';


export interface TransferRecord {
  id: string;
  date: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  fee: number;
}

@Component({
  selector: 'app-transfer-history',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule
    ],
  templateUrl: './transfer-history.component.html',
  styleUrl: './transfer-history.component.scss'
})
export class TransferHistoryComponent {
   displayedColumns: string[] = ['id','date','fromAccount','toAccount','amount','fee'];
  dataSource = new MatTableDataSource<TransferRecord>([]);
  totalItems = 0;
  pageSize = 10;
  lastTransactionDate: string = '';
  startDate: string = '';
  endDate:   string = '';
  today:     string = new Date().toISOString().split('T')[0];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    // 初次載入：所有紀錄
    this.loadData();
  }

  /** 載入轉帳資料，可帶日期區間 */
  loadData(): void {
    this.api.getTransferHistory(this.startDate, this.endDate)
      .then(resp => {
        const data: TransferRecord[] = resp.data;
        this.dataSource.data = data;
        this.totalItems = data.length;
        if (data.length) {
          this.lastTransactionDate = data[0].date;
        }
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      })
      .catch(() => {
        // 可加錯誤訊息處理
      });
  }

  /** 區間日期變動即時篩選 */
  onDateRangeChange(): void {
    this.loadData();
  }
}
