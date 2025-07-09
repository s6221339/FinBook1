import { AuthService } from './../../@services/auth.service';
import { ApiService } from './../../@services/api.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import Swal from 'sweetalert2';
import { MonthlyStatistics } from '../../models/monthlyStatistics';
import { ChartOptions, ChartType } from 'chart.js';


@Component({
  selector: 'app-expense-by-category',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatButtonModule,
    MatCardModule,
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
  pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const label = ctx.label || '';
            const percent = ((ctx.raw ))
          }
        }
      }
    }
  }


  ngOnInit(): void {

  }


}
