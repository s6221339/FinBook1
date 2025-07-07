import { Component, OnInit } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { ApiService } from '../../@services/api.service';
import { AuthService } from '../../@services/auth.service';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-income-expense-trend-chart',
  imports: [FormsModule, BaseChartDirective, CommonModule],
  templateUrl: './income-expense-trend-chart.component.html',
  styleUrl: './income-expense-trend-chart.component.scss',
  standalone: true
})
export class IncomeExpenseTrendChartComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;
  selectedYear = this.currentYear;
  selectedMonth = this.currentMonth;
  years: number[] = [];
  monthList: number[] =[];

  chartLabels: string[] = [];
  chartIncome: number [] = [];
  chartOutlay: number[] = [];
  chartNet: number[] = [];

  singleMonthIncome: number = 0;
  singleMonthOutlay: number = 0;
  singleMonthNet: number = 0;

  ngOnInit(): void {
    this.generateYearList();
    this.updateMonthList();
    this.fetchYearlyData();
    this.fetchMonthlyData();
  }

  generateYearList(): void {
    const startYear = 2001;
    const endYear = this.currentYear;
    this.years = [];
    for(let y = endYear; y >= startYear; y--) {
      this.years.push(y);
    }
  }

  onYearChange(): void {
    this.updateMonthList();
    this.fetchYearlyData();
    this.fetchMonthlyData();
  }

  onMonthChange(): void {
    this.fetchMonthlyData();
  }

  fetchYearlyData(): void {
    const account = this.authService.getCurrentUser()?.account;
    if(!account) return;

    this.apiService.getMonthlyIncomeExpenseSummary({
      account,
      year: this.selectedYear,
      month: 0
    }).then(res => {
      const list = res.data.statisticsList || [];

      //  預設所有月份為 0
      const incomeMap = new Map<number, number>();
      const outlayMap = new Map<number, number>();
      for(let i = 1; i <= 12 ; i++) {
        incomeMap.set(i, 0);
        outlayMap.set(i, 0);
      }

      for(const item of list) {
        incomeMap.set(item.month, item.income);
        outlayMap.set(item.month, item.outlay);
      }

      const lastMonth = (this.selectedYear == this.currentYear) ? this.currentMonth : 12;
      this.chartLabels = [];
      this.chartIncome = [];
      this.chartOutlay = [];
      this.chartNet = [];

      for(let i = 1; i <= lastMonth; i++) {
        const label = `${String(this.selectedYear).slice(2)}年${i}月`;
        const income = incomeMap.get(i) || 0;
        const outlay = outlayMap.get(i) || 0;
        const net = income - outlay;

        this.chartLabels.push(label);
        //  以 K 為單位
        this.chartIncome.push(income / 1000);
        this.chartOutlay.push(outlay / 1000);
        this.chartNet.push(net / 1000);
      }
    });
  }

  fetchMonthlyData(): void {
    const account = this.authService.getCurrentUser()?.account;
    if(!account) return;

    this.apiService.getMonthlyIncomeExpenseSummary({
      account,
      year: this.selectedYear,
      month: this.selectedMonth
    }).then(res => {
      const item = res.data.statisticsList?.[0];
      this.singleMonthIncome = item?.income || 0;
      this.singleMonthOutlay = item?.outlay || 0;
      this.singleMonthNet = this.singleMonthIncome - this.singleMonthOutlay;
    });
  }

  updateMonthList(): void {
    const maxMonth = (this.selectedYear == this.currentYear) ? this.currentMonth : 12;
    this.monthList = [];
    for(let m = 1; m <= maxMonth; m++) {
      this.monthList.push(m);
    }

    //  防止已選月份超過最大月份
    if(this.selectedMonth > maxMonth) {
      this.selectedMonth = maxMonth;
    }
  }

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw as number;
            const originalValue = value * 1000;
            return `${label}：${originalValue.toLocaleString()} 元`;
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: '金額（K）'
        }
      }
    }
  };

}
