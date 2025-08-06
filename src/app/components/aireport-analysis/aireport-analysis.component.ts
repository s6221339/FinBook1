import { ApiService } from './../../@services/api.service';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { GetAIAnalysisRequest } from '../../models/request/getAIAnalysisRequest';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-aireport-analysis',
  imports: [FormsModule, MatIconModule],
  templateUrl: './aireport-analysis.component.html',
  styleUrl: './aireport-analysis.component.scss',
  standalone: true
})
export class AIReportAnalysisComponent implements OnInit{

  constructor(
    private apiService: ApiService
  ) {}

  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() +1;
  yearList: number[] = [];
  monthList: number[] = [];

  selectedYear!: number;
  selectedMonth!: number;

  reportText: string | null = null;

  ngOnInit(): void {
    this.generateYearAndMonthOptions();
    this.setDefaultDate();
  }

  //  建立年份與樂份選單（排除當月與未來）
  generateYearAndMonthOptions() {
    const startYear = 2001;
    const now = new Date();
    this.yearList = [];
    for(let y = startYear; y < this.currentYear; y++) {
      this.yearList.push(y);
    }
    //  如果是當前年份，也允許查詢上個月以前
    this.yearList.push(this.currentYear);
  }

  //  根據選擇年份更新月份清單（排除當月與未來）
  updateMonthOptions():boolean {
    const isThisYear = this.selectedYear == this.currentYear;
    const maxMonth = isThisYear ? this.currentMonth - 1 : 12;

    this.monthList = [];
    for(let m = 1; m <= maxMonth; m++) {
      this.monthList.push(m);
    }
    console.log('[updateMonthOptions] monthList:', this.monthList);
    //  若當年選擇月份不在合法範圍，則重設
    if(!this.monthList.includes(this.selectedMonth)) {
      this.selectedMonth = this.monthList[this.monthList.length - 1];
      return true;
    }
    return false;
  }

  //  預設為上個月
  setDefaultDate() {
    if(this.currentMonth == 1) {
      this.selectedYear = this.currentYear - 1;
      this.selectedMonth = 12;
    }
    else {
      this.selectedYear = this.currentYear;
      this.selectedMonth = this.currentMonth - 1;
    }

    this.updateMonthOptions(); // month 可能會被 update 修改
    this.queryReport();
  }

  //  查詢 AI 報告
  async queryReport() {
    const request: GetAIAnalysisRequest = {
      from: { year: this.selectedYear, month: this.selectedMonth, day: null },
      to: { year:this.selectedYear, month: this.selectedMonth, day: null }
    };
    console.log('[queryReport] request:', request);
    try {
      const res = await this.apiService.getAIAnalysis(request);
      if(res.data.code == 200 && res.data.analysisList.length > 0) {
        this.reportText = res.data.analysisList[0].analysis;
      }
      else {
        this.reportText = null;
      }
    } catch (err) {
      this.reportText = null;
      Swal.fire('錯誤', '無法取得 AI 分析資料，請稍後再試', 'error');
    }
  }

  //  切換選單後重新查詢
  onDateChange() {
    console.log('[onDateChange] selectedYear:', this.selectedYear, 'selectedMonth:', this.selectedMonth);
    // 延遲到 ngModel 實際更新後再查詢
    setTimeout(() => {
      this.queryReport();
    }, 0);
  }

}
