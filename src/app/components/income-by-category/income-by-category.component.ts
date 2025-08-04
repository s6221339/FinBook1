import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ApiService } from '../../@services/api.service';
import { AuthService } from '../../@services/auth.service';
import { ChartOptions, ChartType } from 'chart.js';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';
import { IncomeItemStatistics } from '../../models/incomeItemStatistics';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { CustomPaginatorComponent } from '../custom-paginator/custom-paginator.component';
Chart.register(PieController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-income-by-category',
  imports: [
    FormsModule,
    BaseChartDirective,
    CommonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    CustomPaginatorComponent
  ],
  templateUrl: './income-by-category.component.html',
  styleUrl: './income-by-category.component.scss',
  standalone: true
})
export class IncomeByCategoryComponent implements OnInit, AfterViewInit {

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() +1 ;
  years: number[] = [];
  months: number[] = [];

  @ViewChild(MatSort) sort!: MatSort;

  rawStatisticsList: IncomeItemStatistics[] = [];
  filteredPaymentInfo: { type: string, totalAmount: number, color: string }[] = [];
  dataSource = new MatTableDataSource<{ type: string, totalAmount: number, color: string }>();

  // 分頁控制
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalFilteredItems: number = 0;

  pieChartLabels: string[] = [];
  pieChartData: number[] = [];
  pieChartType: ChartType = 'pie';
  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const label = ctx.label || '';
            const value = ctx.raw || 0;
            const total = this.totalExpense || 1;
            const percent = ((value / total) * 100).toFixed(1);
            return [`${label}：${percent}％`, `金額：${(+value).toLocaleString()}元`];
          }
        }
      },
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          font: { size: 14 }
        }
      }
    }
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
  totalExpense: number = 0;
  pieChartDataSet: any = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: []
    }]
  };

  ngOnInit(): void {
    this.generateYearList();
    this.generateMonthList();
    this.loadStatistics();
  }

  generateYearList() {
    const startYear = 2001;
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i).reverse();
  }

  generateMonthList() {
    const currentMonth = new Date().getMonth() + 1;
    this.months = Array.from({ length: currentMonth }, (_, i) => i + 1);
  }

  loadStatistics(): void {
    const account = this.authService.getCurrentUser()?.account;
    if(!account) return;

    const payload = {
      account,
      year: this.selectedYear,
      month: 0
    };

    this.apiService.getAccountIncomeItemByMonthAndYear(payload)
      .then(res => {
        if(res.data.code == 200) {
          this.rawStatisticsList = res.data.statisticsList || [];
          this.filterByMonth();
        }
      })
      .catch(err => {
        console.error('取得統計資料失敗', err);
      });
  }

  filterByMonth(): void {
    const data = this.rawStatisticsList.find(stat => stat.month == this.selectedMonth);
    console.log('🔍 當月統計資料:', data);
    const typeList = data?.paymentTypeInfoList ?? [];
    const incomeType = typeList.find(t => t.type == '收入');
    console.log('🔍 收入類型資料:', incomeType);
    const detailList = incomeType?.amountDetailList || [];
    console.log('🔍 收入細項 detailList:', detailList);

    //  總收入
    this.totalExpense = detailList.reduce((sum, d) => sum + d.amount, 0);
    console.log('🔢 本月總收入 totalExpense:', this.totalExpense);
    //  援筆圖資料與顏色
    this.pieChartLabels = detailList.map(d => d.item);
    this.pieChartData = detailList.map(d => d.amount);
    console.log('📊 圓餅圖 Labels:', this.pieChartLabels);
    console.log('📊 圓餅圖 Data:', this.pieChartData);

    //  建立顏色對應表
    const chartColors = this.pieChartColors.slice(0, this.pieChartData.length);

    //  更新 chart dataSet （統一避免 inline）
    this.pieChartDataSet = {
      labels: this.pieChartLabels,
      datasets: [{
        data: this.pieChartData,
        backgroundColor: chartColors
      }]
    };
    console.log('🖌️ pieChartDataSet:', this.pieChartDataSet);

    //  補這段讓表格能正確顯示
    this.filteredPaymentInfo = detailList.map((d, i) => ({
      type: d.item,
      totalAmount: d.amount,
      color: chartColors[i]
    }));

    // 更新 dataSource
    this.dataSource.data = this.filteredPaymentInfo;
    this.totalFilteredItems = this.filteredPaymentInfo.length;

    // 確保排序功能在資料更新後仍然有效
    this.setupSort();

    // 如果有排序設定，重新應用排序
    this.applySort();
  }

  onYearChange(): void {
    //  重送API
    this.loadStatistics();
  }

  onMonthChange(): void {
    //  單純篩月
    this.filterByMonth();
  }

  getAveragePerDay(): number {
    return this.totalExpense / 30;
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
        if (this.sort.active === 'totalAmount') {
          return this.sort.direction === 'asc' ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount;
        } else if (this.sort.active === 'percentage') {
          const aPercent = (a.totalAmount / this.totalExpense) * 100;
          const bPercent = (b.totalAmount / this.totalExpense) * 100;
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
