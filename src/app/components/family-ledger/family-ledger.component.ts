import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './../../@services/auth.service';
import { ApiService } from './../../@services/api.service';
import { Component, OnInit } from '@angular/core';
import { Balance } from '../../models/balance';
import { PendingDeletionPayment } from '../../models/PendingDeletionPayment';
import { PaymentInfos } from '../../models/PaymentInfos';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-family-ledger',
  imports: [FormsModule, DatePipe],
  templateUrl: './family-ledger.component.html',
  styleUrl: './family-ledger.component.scss',
  standalone: true
})
export class FamilyLedgerComponent implements OnInit{

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

  ngOnInit(): void {
    this.initYearMonthDropdowns();
    this.loadFamilyBalances();
  }

  //  初始化年 / 月 選單
  initYearMonthDropdowns(): void {
    const currentYear = new Date().getFullYear();
    for(let year = 2001; year <= currentYear; year++) {
      this.availableYears.push(year);
    }

    const currentMonth = new Date().getMonth() + 1;
    this.availableMonths = Array.from({ length: currentMonth }, (_, i) => i + 1);
  }

  //  取得所有家庭帳戶
  loadFamilyBalances(): void {
    const account = this.authService.getCurrentUser()?.account;
    if(!account) return;

    this.apiService.getFamilyBalanceByAccount(account)
      .then(res => {
        if(res.data.code == 200) {
          this.familyBalances = res.data.balanceList;
          //  預設選第一個帳戶
          if(this.familyBalances.length > 0) {
            this.selectedBalanceId = this.familyBalances[0].balanceId;
            this.fetchMonthlyData();
          }
        }
      });
  }

  //  根據帳號 / 年 / 月 取得所有家庭帳戶的資料
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

  //  依照 balanceId 篩選單一帳戶
  filterBySelectedBalance(): void {
    this.checkedMap = {};

    const target = this.allPayments.find(p => p.balanceId == this.selectedBalanceId);
    this.filteredPayments = target?.paymentInfoList || [];
  }

  //  任何選單變動時重新查詢
  onFilterChange(): void {
    this.fetchMonthlyData();
  }

  onCheckboxChange(): void {
    const checkedItems = this.filteredPayments.filter(p => this.checkedMap[p.paymentId]);

    this.selectedPaymentId = checkedItems.length == 1 ? checkedItems[0].paymentId : null;
  }

  onEdit(): void {
    const selectedIds = Object.keys(this.checkedMap)
      .filter(pid => this.checkedMap[+pid])
      .map(pid => +pid);

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
    const selectedIds = Object.keys(this.checkedMap)
      .filter(pid => this.checkedMap[+pid])
      .map(pid => +pid);

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
          //  執行刪除流程
          const deletePromises = selectedIds.map(pid => this.apiService.deletePayment(pid));

          Promise.all(deletePromises)
            .then(() => {
              Swal.fire('刪除成功', '', 'success');
              //  重新取得帳款資料
              this.fetchMonthlyData();
            })
            .catch(err => {
              console.error('刪除失敗', err);
              Swal.fire('刪除失敗', '請稍後再試', 'error');
            });
        }
      });
  }

}
