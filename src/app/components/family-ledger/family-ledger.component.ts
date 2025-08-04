import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './../../@services/auth.service';
import { ApiService } from './../../@services/api.service';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Balance } from '../../models/balance';
import { PendingDeletionPayment } from '../../models/PendingDeletionPayment';
import { PaymentInfos } from '../../models/PaymentInfos';
import { FormsModule } from '@angular/forms';
import { DatePipe, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CustomPaginatorComponent } from '../custom-paginator/custom-paginator.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-family-ledger',
  imports: [
    FormsModule,
    DatePipe,
    CommonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    CustomPaginatorComponent
  ],
  templateUrl: './family-ledger.component.html',
  styleUrl: './family-ledger.component.scss',
  standalone: true
})
export class FamilyLedgerComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  familyBalances: Balance[] = [];
  selectedBalanceId: number = -1;
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  availableYears: number[] = [];
  availableMonths: number[] = [];
  selectedPaymentId: number | null = null;

  allPayments: PendingDeletionPayment[] = [];
  filteredPayments: PaymentInfos[] = [];
  checkedMap: Record<number,boolean> = {};

  // Angular Material Table 相關屬性
  dataSource = new MatTableDataSource<PaymentInfos>([]);
  displayedColumns: string[] = ['select', 'type', 'item', 'description', 'amount', 'recordDate'];
  selection = new Map<number, PaymentInfos>();

  // 分頁相關屬性
  currentPage = 1;
  itemsPerPage = 5;
  totalFilteredItems = 0;

  ngOnInit(): void {
    this.initYearMonthDropdowns();
    this.loadFamilyBalances();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.setupSort();
    }, 100);
  }

  // 設置排序
  setupSort(): void {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    } else {
      setTimeout(() => {
        this.setupSort();
      }, 100);
    }
  }

  // 初始化年 / 月 選單
  initYearMonthDropdowns(): void {
    const currentYear = new Date().getFullYear();
    for(let year = 2001; year <= currentYear; year++) {
      this.availableYears.push(year);
    }

    const currentMonth = new Date().getMonth() + 1;
    this.availableMonths = Array.from({ length: currentMonth }, (_, i) => i + 1);
  }

  // 取得所有家庭帳戶
  loadFamilyBalances(): void {
    const account = this.authService.getCurrentUser()?.account;
    if(!account) return;

    this.apiService.getFamilyBalanceByAccount(account)
      .then(res => {
        if(res.data.code == 200) {
          this.familyBalances = res.data.balanceList;
          // 預設選第一個帳戶
          if(this.familyBalances.length > 0) {
            this.selectedBalanceId = this.familyBalances[0].balanceId;
            this.fetchMonthlyData();
          }
        }
      });
  }

  // 根據帳號 / 年 / 月 取得所有家庭帳戶的資料
  fetchMonthlyData(): void {
    const account = this.authService.getCurrentUser()?.account;
    if(!account) return;

    const payload = {
      account,
      year: this.selectedYear,
      month: this.selectedMonth
    }

    this.apiService.getMonthlyPaymentByFamiltBalance(payload)
      .then(res => {
        if(res.data.code == 200) {
          this.allPayments = res.data.balanceWithPaymentList;
          this.filterBySelectedBalance();
        }
      });
  }

  // 依照 balanceId 篩選單一帳戶
  filterBySelectedBalance(): void {
    this.checkedMap = {};
    this.selection.clear();

    const target = this.allPayments.find(p => p.balanceId == this.selectedBalanceId);
    this.filteredPayments = target?.paymentInfoList || [];

    // 更新 Material Table 資料源
    this.dataSource.data = this.filteredPayments;
    this.totalFilteredItems = this.filteredPayments.length;
    this.currentPage = 1;
  }

  // 任何選單變動時重新查詢
  onFilterChange(): void {
    this.fetchMonthlyData();
  }

  // 取得選中的家庭帳戶名稱
  getSelectedFamilyName(): string {
    const selectedBalance = this.familyBalances.find(b => Number(b.balanceId) === Number(this.selectedBalanceId));
    console.log('目前選擇 balanceId:', this.selectedBalanceId, '對應名稱:', selectedBalance?.name);
    return selectedBalance?.name || '';
  }

  // 檢查是否有選中的項目
  hasSelection(): boolean {
    return this.selection.size > 0;
  }

  // 全選/取消全選
  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.filteredPayments.forEach(row => this.selection.set(row.paymentId, row));
    }
  }

  // 檢查是否全選
  isAllSelected(): boolean {
    const numSelected = this.selection.size;
    const numRows = this.filteredPayments.length;
    return numSelected === numRows;
  }

  // 切換選中狀態
  toggleSelection(row: PaymentInfos): void {
    if (this.selection.has(row.paymentId)) {
      this.selection.delete(row.paymentId);
    } else {
      this.selection.set(row.paymentId, row);
    }
  }

  onCheckboxChange(): void {
    const checkedItems = this.filteredPayments.filter(p => this.checkedMap[p.paymentId]);

    this.selectedPaymentId = checkedItems.length == 1 ? checkedItems[0].paymentId : null;
  }

  onEdit(): void {
    const selectedIds = Array.from(this.selection.keys());

    if(selectedIds.length == 0) {
      Swal.fire('請先勾選要編輯的帳款', '', 'warning');
    }
    else if(selectedIds.length > 1) {
      Swal.fire('一次只能編輯一筆帳款', '', 'warning');
    }
    else {
      this.router.navigate(['/createOrEditFamily/edit', selectedIds[0]]);
    }
  }

  onCreate(): void {
    this.router.navigate(['/createOrEditFamily/create', this.selectedBalanceId]);
  }

  onDelete(): void {
    const selectedIds = Array.from(this.selection.keys());

    if(selectedIds.length == 0) {
      Swal.fire('請先勾選要刪除的帳款', '', 'warning');
      return;
    }

    Swal.fire({
      title: '確定要刪除選取的帳款嗎？',
      text: `共 ${selectedIds.length} 筆資料將被刪除`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '刪除',
      cancelButtonText: '取消'
    })
      .then(result => {
        if(result.isConfirmed) {
          // 執行刪除流程
          const deletePromises = selectedIds.map(pid => this.apiService.deletePayment(pid));

          Promise.all(deletePromises)
            .then(() => {
              Swal.fire('刪除成功', '', 'success');
              // 重新取得帳款資料
              this.fetchMonthlyData();
            })
            .catch(err => {
              console.error('刪除失敗', err);
              Swal.fire('刪除失敗', '請稍後再試', 'error');
            });
        }
      });
  }

  // 分頁相關方法
  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onPageSizeChange(pageSize: number): void {
    this.itemsPerPage = pageSize;
    this.currentPage = 1;
  }
}
