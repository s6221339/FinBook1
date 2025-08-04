import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ApiService } from '../../@services/api.service';
import { AuthService } from '../../@services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions, ChartType } from 'chart.js';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
import { Statistics } from '../../models/statistics';
Chart.register(PieController, ArcElement, Tooltip, Legend);
import Swal from 'sweetalert2';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { CustomPaginatorComponent } from '../custom-paginator/custom-paginator.component';

@Component({
  selector: 'app-income-by-account',
  imports: [BaseChartDirective, FormsModule, CommonModule, MatIconModule, MatTableModule, MatSortModule, CustomPaginatorComponent],
  templateUrl: './income-by-account.component.html',
  styleUrl: './income-by-account.component.scss',
  standalone: true,
})
export class IncomeByAccountComponent implements OnInit, AfterViewInit {

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;
  years: number[] = [];
  months: number[] = [];

  @ViewChild(MatSort) sort!: MatSort;

  rawStatisticsList: Statistics[] = [];
  filteredBalances: { name: string; income: number; color: string }[] = [];
  dataSource = new MatTableDataSource<{ name: string; income: number; color: string }>();

  // 分頁控制
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalFilteredItems: number = 0;

  totalIncome: number = 0;

  pieChartLabels: string[] = [];
  pieChartData: number[] = [];
  pieChartDataSet: any = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: []
    }]
  };
  pieChartColors: string[] = [
    "#E74C3C", // 鮮紅色
    "#F39C12", // 橙色
    "#27AE60", // 綠色
    "#8E44AD", // 紫色
    "#E67E22", // 深橙色
    "#2ECC71", // 亮綠色
    "#9B59B6", // 淺紫色
    "#F1C40F", // 黃色
    "#E91E63", // 粉紅色
    "#FF5722", // 深橙紅色
    "#4CAF50", // 標準綠色
    "#673AB7", // 深紫色
  ];

  pieChartType: ChartType = 'pie';
  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: (ctx) => {
          const sum = ctx.chart.data.datasets[0].data.reduce((a: any, b: any) => +a + +b, 0);
          return sum > 0;
        },
        callbacks: {
          label: ctx => {
            const label = ctx.label || '';
            const value = ctx.raw || 0;
            const percent = ((+value / (this.totalIncome || 1)) * 100).toFixed(1);
            return [`${label}：${percent}％`, `金額：${(+value).toLocaleString()}元`];
          }
        }
      },
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          font: { size: 14}
        }
      }
    }
  };

  ngOnInit(): void {
    this.generateYearMonth();
    this.loadStatistics();
  }

  generateYearMonth() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    //  年份從 2001 到今年，遞減排列
    this.years = Array.from({ length: currentYear - 2001 + 1 }, (_, i) => currentYear - i);

    //  預設年份為當前年，限制月份到當月
    this.generateMonthList(currentYear);
  }

  generateMonthList(selectedYear: number) {
    const now = new Date();
    const isCurrentYear = selectedYear == now.getFullYear();

    const maxMonth = isCurrentYear ? now.getMonth() + 1 : 12;

    this.months = Array.from({ length: maxMonth }, (_, i) => i + 1);
  }

  loadStatistics() {
    const account = this.authService.getCurrentUser()?.account;
    if(!account) return;

    const payload = { account, year: this.selectedYear, month: 0 };
    this.apiService.getIncomeAndExpenseByMonthAndYear(payload)
      .then(res => {
        if(res.data.code == 200) {
          this.rawStatisticsList = res.data.statisticsList || [];
          this.filterByMonth();
        }
      })
      .catch(err => {
        console.error('獲取支出資料失敗', err)
      });
  }

  filterByMonth() {
    const monthData = this.rawStatisticsList.find(d => d.month == this.selectedMonth);
    if(!monthData) return;

    const balances = (monthData.incomeAndOutlayInfoVOList || [])
      .filter(a => a.familyInfo == null);

    // 為每個項目添加顏色
    this.filteredBalances = balances.map((a, index) => ({
      name: a.balanceInfo.name,
      income: a.income,
      color: this.pieChartColors[index % this.pieChartColors.length]
    }));

    // 更新 dataSource
    this.dataSource.data = this.filteredBalances;
    this.totalFilteredItems = this.filteredBalances.length;

    // 確保排序功能在資料更新後仍然有效
    this.setupSort();

    // 如果有排序設定，重新應用排序
    this.applySort();

    this.totalIncome = this.filteredBalances.reduce((sum, a) => sum + a.income, 0);

    this.pieChartLabels = this.filteredBalances.map(a => a.name);
    this.pieChartData = this.filteredBalances.map(a => a.income);
    this.pieChartDataSet = {
      labels: this.pieChartLabels,
      datasets: [{
        data: this.pieChartData,
        backgroundColor: this.pieChartColors.slice(0, this.pieChartData.length)
      }]
    };
  }

  onYearChange() {
    this.loadStatistics();
  }

  onMonthChange() {
    this.filterByMonth();
  }

  getAveragePerDay(): number {
    return this.totalIncome / 30;
  }

  ngAfterViewInit(): void {
    // 使用延遲確保表格完全渲染
    setTimeout(() => {
      this.setupSort();
    }, 100);
  }

  private setupSort(): void {
    if (this.sort) {
      this.dataSource.sort = this.sort;
      this.sort.sortChange.subscribe(() => {
        this.currentPage = 1;
        // 手動排序資料
        this.applySort();
      });
    } else {
      // 如果還是沒有，再試一次
      setTimeout(() => {
        this.setupSort();
      }, 100);
    }
  }

  private applySort(): void {
    if (this.sort && this.sort.active) {
      // 手動排序
      const sortedData = [...this.dataSource.data].sort((a, b) => {
        if (this.sort.active === 'income') {
          return this.sort.direction === 'asc' ? a.income - b.income : b.income - a.income;
        } else if (this.sort.active === 'percentage') {
          const aPercent = (a.income / this.totalIncome) * 100;
          const bPercent = (b.income / this.totalIncome) * 100;
          return this.sort.direction === 'asc' ? aPercent - bPercent : bPercent - aPercent;
        }
        return 0;
      });

      this.dataSource.data = sortedData;
    }
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
  }

  onPageSizeChange(newPageSize: number): void {
    this.itemsPerPage = newPageSize;
    this.currentPage = 1;
  }
}
