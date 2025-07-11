import { AuthService } from './../../@services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Balance } from '../../models/balance';
import { PendingDeletionPayment } from '../../models/PendingDeletionPayment';
import { ApiService } from './../../@services/api.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import Swal from 'sweetalert2';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CustomPaginatorComponent } from '../custom-paginator/custom-paginator.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pending-deletion',
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, FormsModule, MatOptionModule, MatInputModule, MatDatepickerModule, MatCardModule, MatIconModule, CustomPaginatorComponent, MatCheckboxModule, MatTableModule, MatSortModule, MatButtonModule],
  templateUrl: './pending-deletion.component.html',
  styleUrl: './pending-deletion.component.scss'
})
export class PendingDeletionComponent implements OnInit{

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ){}

  balances: Balance[] = []; //  所有使用者帳戶
  selectedBalanceId: number | null = null;  //  使用者選擇的 balanceId
  pendingList: PendingDeletionPayment[] = []; //  待刪區款項
  filteredPayments: any[] = []; //  經過篩選的要呈現的待刪除帳款
  // 分頁相關
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalFilteredItems: number = 0;
  allFilteredPayments: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<any>(true, []);
  displayedColumns: string[] = [
    'select',
    'type',
    'item',
    'description',
    'amount',
    'recordDate',
    'lifeTime'
  ];
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    //  取得帳戶
    this.apiService.getBalanceByAccount(this.currentAccount)
    .then(res => {
      this.balances = res.data.balanceList || [];
      if(this.balances.length > 0) {
        this.selectedBalanceId = this.balances[0].balanceId;
        this.loadPayments();
      }
    })
    .catch(err => {
      console.error('載入帳戶失敗', err);
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '帳戶資料載入失敗，請稍後再試',
        confirmButtonText: '確定'
      });
    });
  }

  get currentAccount(): string {
    const user = this.authService.getCurrentUser();
    if(!user) {
      Swal.fire('錯誤', '尚未登入，請重新登入', 'error');
      throw new Error('未登入使用者');
    }
    return user.account;
  }

  //  載入待刪款項
  loadPayments(): void {
    this.apiService.getPaymentInPendingDeletion(this.currentAccount)
    .then(res => {
      this.pendingList = res.data.balanceWithPaymentList || [];
      this.filterByBalanceId();
    })
    .catch(err => {
      console.error('取得待刪除資料失敗', err);
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '待刪除帳款資料載入失敗，請稍後再試',
        confirmButtonText: '確定'
      });
    });
  }

  //  根據使用者選擇帳戶篩選待刪區帳款（只包含生命週期大於 0 天的）
  filterByBalanceId(): void {
    const matched = this.pendingList.find(p => p.balanceId == this.selectedBalanceId);
    this.allFilteredPayments = matched?.paymentInfoList.filter(p => p.lifeTime >= 0) || [];
    this.totalFilteredItems = this.allFilteredPayments.length;
    this.updatePagedData();
  }

  // 分頁切片
  updatePagedData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pagedData = this.allFilteredPayments.slice(startIndex, endIndex);
    this.dataSource.data = pagedData;
    this.selection.clear();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  // 分頁事件處理
  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.updatePagedData();
  }

  // 每頁筆數變更事件處理
  onPageSizeChange(newPageSize: number): void {
    this.itemsPerPage = newPageSize;
    this.currentPage = 1; // 重置到第一頁
    this.updatePagedData();
  }

  //  使用者選擇帳戶時觸發
  onBalanceChange(){
    this.filterByBalanceId();
    this.currentPage = 1;
    this.updatePagedData();
  }

  //  切換全選/取消全選
  //  添加 selected 屬性
  toggleSelectAll(): void {
    this.selection.clear();
  }

  //  復原勾選項目
  recoverSelectedPayments(): void {
    const selected = this.selection.selected;
    if (selected.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: '提醒',
        text: '請先選擇要復原的資料',
        confirmButtonText: '確定'
      });
      return;
    }

    const ids = selected.map(p => p.paymentId);
    this.apiService.recoveryPayments(ids)
      .then(res => {
        Swal.fire({
          icon: 'success',
          title: '成功',
          text: '復原成功',
          confirmButtonText: '確定'
        });
        this.loadPayments();
      })
      .catch(err => {
        console.error('復原失敗', err);
        Swal.fire({
          icon: 'error',
          title: '復原失敗',
          text: '請稍後再試',
          confirmButtonText: '確定'
        });
      });
  }

  // 多選/全選邏輯
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows && numRows > 0;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  toggleSelection(row: any) {
    this.selection.toggle(row);
  }

  selectedBalanceName(): string {
    const found = this.balances.find(b => b.balanceId == this.selectedBalanceId);
    return found ? found.name : '未選擇';
  }

}
