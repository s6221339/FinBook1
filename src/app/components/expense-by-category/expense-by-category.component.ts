import { AuthService } from './../../@services/auth.service';
import { ApiService } from './../../@services/api.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonthlyStatistics } from '../../models/monthlyStatistics';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(PieController, ArcElement, Tooltip, Legend);
import { ChartOptions, ChartType } from 'chart.js';
import { MatIconModule } from "@angular/material/icon"

@Component({
  selector: 'app-expense-by-category',
  imports: [
    FormsModule, BaseChartDirective, CommonModule, MatIconModule
  ],
  templateUrl: './expense-by-category.component.html',
  styleUrl: './expense-by-category.component.scss',
  standalone: true
})
export class ExpenseByCategoryComponent implements OnInit{

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() +1 ;
  years: number[] = [];
  months: number[] = [];

  rawStatisticsList: MonthlyStatistics[] = [];
  filteredPaymentInfo: { type: string, totalAmount: number }[] = [];

  pieChartLabels: string[] = [];
  pieChartData: number[] = [];
  pieChartType: ChartType = 'pie';
  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 16 },
        bodyFont: { size: 14 },
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(66, 86, 165, 0.3)",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => {
            const label = ctx.label || ""
            const total = this.totalExpense || 1
            const percent = ((ctx.raw / total) * 100).toFixed(1)
            const amount = ctx.raw.toLocaleString()
            return [`${label}：${percent}％`, `金額：${amount} 元`]
          },
        },
      },
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            weight: 500,
          },
        },
      },
    },
  }

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
  ]
  totalExpense = 0
  pieChartDataSet: any = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
      },
    ],
  }

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

    this.apiService.getAccountTypeMonthlySummary(payload)
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
    this.filteredPaymentInfo = (data?.paymentInfo || []).filter(p => p.type != '收入');

    //  援筆圖資料與顏色
    this.pieChartLabels = this.filteredPaymentInfo.map(p => p.type);
    this.pieChartData = this.filteredPaymentInfo.map(p => p.totalAmount);
    //  預先計算總支出避免 tooltip 觸發 re-render
    this.totalExpense = this.filteredPaymentInfo.reduce((sum, p) => sum + p.totalAmount, 0);

    //  更新 chart dataSet （統一避免 inline）
    this.pieChartDataSet = {
      labels: this.pieChartLabels,
      datasets: [{
        data: this.pieChartData,
        backgroundColor: this.pieChartColors.slice(0, this.pieChartData.length)
      }]
    };
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

}
