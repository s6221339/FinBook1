import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-income-by-account',
  imports: [BaseChartDirective, FormsModule, CommonModule, MatIconModule],
  templateUrl: './income-by-account.component.html',
  styleUrl: './income-by-account.component.scss',
  standalone: true,
})
export class IncomeByAccountComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;
  years: number[] = [];
  months: number[] = [];

  rawStatisticsList: Statistics[] = [];
  filteredBalances: { name: string; income: number }[] = [];
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
  pieChartColors: string[] = ['#F44336', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0','#00BCD4', '#795548', '#FFEB3B', '#00E676', '#FF4081', '#3F51B5', '#607D8B'];

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

    this.filteredBalances = balances.map(a => ({
      name: a.balanceInfo.name,
      income: a.income
    }));

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

}
