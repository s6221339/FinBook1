import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { ApiService } from '../../@services/api.service';
import { AuthService } from '../../@services/auth.service';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { MatIconModule } from "@angular/material/icon"

function getCssVar(name: string) {
  const fromBody = getComputedStyle(document.body).getPropertyValue(name).trim();
  if (fromBody) return fromBody;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

@Component({
  selector: 'app-income-expense-trend-chart',
  imports: [FormsModule, BaseChartDirective, CommonModule, MatIconModule],
  templateUrl: './income-expense-trend-chart.component.html',
  styleUrl: './income-expense-trend-chart.component.scss',
  standalone: true
})
export class IncomeExpenseTrendChartComponent implements OnInit, AfterViewInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  private themeObserver?: MutationObserver;
  netLineColor = getCssVar('--primary');

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

  // 將 chartDatasets 改為屬性而不是 getter
  chartDatasets: any[] = [];

  ngOnInit(): void {
    this.generateYearList();
    this.updateMonthList();
    this.fetchYearlyData();
    this.fetchMonthlyData();
    this.updateChartColors();
  }

  ngAfterViewInit() {
    const body = document.body;
    this.themeObserver = new MutationObserver(() => {
      this.updateChartColors();
    });
    this.themeObserver.observe(body, { attributes: true, attributeFilter: ['class'] });
  }

  ngOnDestroy() {
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
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

      // 更新圖表數據集
      this.updateChartDatasets();
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

  // 新增方法來更新圖表數據集
  updateChartDatasets(): void {
    this.chartDatasets = [
      {
        data: this.chartIncome,
        label: '收入',
        type: 'bar' as const,
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        order: 2
      },
      {
        data: this.chartOutlay,
        label: '支出',
        type: 'bar' as const,
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        order: 3
      },
      {
        data: this.chartNet,
        label: '收支',
        type: 'line' as const,
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        borderColor: this.netLineColor,
        fill: false,
        borderWidth: 4,
        pointBackgroundColor: 'rgb(107, 114, 128)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 8,
        pointHoverRadius: 10,
        order: 1,
        tension: 0.2
      }
    ];
  }

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: "easeInOutQuart",
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 20, // 放大字體
            weight: 500,
          },
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 20 }, // 放大 tooltip 標題
        bodyFont: { size: 18 },  // 放大 tooltip 內容
        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
        bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
        borderColor: "rgba(66, 86, 165, 0.3)",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || ""
            const value = context.raw as number
            const originalValue = value * 1000
            return `${label}：${originalValue.toLocaleString()} 元`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            size: 18, // 放大 X 軸字體
          },
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
        },
      },
      y: {
        title: {
          display: true,
          text: "金額（K）",
          font: {
            size: 20, // 放大 Y 軸標題
            weight: 600,
          },
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            size: 18, // 放大 Y 軸字體
          },
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
        },
      },
    },
  }

  updateChartColors() {
    const textColor = getCssVar('--text-primary');
    const netColor = getCssVar('--primary');
    console.log('textColor', textColor);
    this.netLineColor = netColor;

    // 更新圖表數據集的顏色
    this.updateChartDatasets();

    // 更新 chartOptions 內所有 color 屬性
    if (
      this.chartOptions &&
      this.chartOptions.plugins &&
      this.chartOptions.plugins.legend &&
      this.chartOptions.plugins.legend.labels
    ) {
      this.chartOptions.plugins.legend.labels.color = textColor;
    }

    if (
      this.chartOptions &&
      this.chartOptions.plugins &&
      this.chartOptions.plugins.tooltip
    ) {
      this.chartOptions.plugins.tooltip.titleColor = '#fff';
      this.chartOptions.plugins.tooltip.bodyColor = '#fff';
    }

    if (
      this.chartOptions &&
      this.chartOptions.scales &&
      this.chartOptions.scales['x'] &&
      this.chartOptions.scales['x'].ticks
    ) {
      this.chartOptions.scales['x'].ticks.color = textColor;
    }

    if (
      this.chartOptions &&
      this.chartOptions.scales &&
      this.chartOptions.scales['y'] &&
      this.chartOptions.scales['y'].ticks
    ) {
      this.chartOptions.scales['y'].ticks.color = textColor;
    }

    if (
      this.chartOptions &&
      this.chartOptions.scales &&
      this.chartOptions.scales['y'] &&
      (this.chartOptions.scales['y'] as any).title
    ) {
      (this.chartOptions.scales['y'] as any).title.color = textColor;
    }
    // 重新 assign options 以觸發變更
    this.chartOptions = { ...this.chartOptions };
    this.chart?.update();
  }
}
