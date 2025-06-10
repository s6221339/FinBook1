import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-ledger',
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, MatIconModule,MatFormFieldModule,
    MatSelectModule, FormsModule],
  providers: [provideNativeDateAdapter()],
  standalone: true,
  templateUrl: './ledger.component.html',
  styleUrl: './ledger.component.scss'
})
export class LedgerComponent implements AfterViewInit,OnInit{

  @ViewChild('batteryFill') batteryFillElement!: ElementRef<SVGRectElement>;
  @ViewChild('batteryPercentText') batteryPercentTextElement!: ElementRef<SVGTextElement>;
  userNames: string[] = ["1", "2"]; //  帳戶下拉式選單
  selectedUserName: string = this.userNames[0]; //  預設帳戶1;
  year: number = new Date().getFullYear(); //  預設帳戶時間（年）
  month: number = new Date().getMonth() + 1;  //  預設帳戶時間（月）
  years: number[] = []; //  年份列表
  months: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; //  月份列表
  budget?: number;  //  預算

  ngOnInit(): void {
    //  初始化年份選單列表
    this.generateYears();
  }

  ngAfterViewInit(): void {
    this.updateBattery(100);
  }

  updateBattery(budgetPercentRemaining: number): void {
    const batteryFillElement = this.batteryFillElement.nativeElement;
    const batteryPercentText = this.batteryPercentTextElement.nativeElement;

    // 最大高度 176px
    const batteryMaxHeight = 176;

    // 特殊處理：如果 < 0，整顆反紅
    if (budgetPercentRemaining < 0) {
      batteryFillElement.setAttribute('height', batteryMaxHeight.toString());
      batteryFillElement.setAttribute('y', '12');
      batteryFillElement.setAttribute('fill', '#d50000'); // 純紅色（你也可用 #f44336 看起來更亮）

      // 👉 加這行讓電池有閃爍紅色動畫
      batteryFillElement.setAttribute('class', 'alert-red');

      // 顯示實際超支 % 數，帶上警告符號
      batteryPercentText.textContent = `${Math.round(budgetPercentRemaining)}%`;

      return; // 直接 return，後面就不跑 gradient 部分了
    }

    // 超過 100% → 整顆綠色 + 閃爍
    if (budgetPercentRemaining > 100) {
      batteryFillElement.setAttribute('height', batteryMaxHeight.toString());
      batteryFillElement.setAttribute('y', '12');
      batteryFillElement.setAttribute('fill', '#2e7d32'); // 綠色
      batteryFillElement.setAttribute('class', 'alert-green'); // 套綠色閃爍

      batteryPercentText.textContent = `${Math.round(budgetPercentRemaining)}%`;
      return;
    }

    const newHeight = Math.max(0, Math.min((budgetPercentRemaining / 100) * batteryMaxHeight, batteryMaxHeight));
    const newY = 12 + (batteryMaxHeight - newHeight);

    batteryFillElement.setAttribute('height', newHeight.toString());
    batteryFillElement.setAttribute('y', newY.toString());

    // 百分比文字
    batteryPercentText.textContent = `${Math.round(budgetPercentRemaining)}%`;

    // 改 gradient stop color
    const gradient = document.querySelector<SVGLinearGradientElement>('#batteryGradient');
    if (!gradient) return; // 防止找不到時報錯
    const stops = gradient.querySelectorAll('stop');

    let color1 = '#76ff03'; // default green
    let color2 = '#4caf50';

    // 根據範圍決定顏色
  if (budgetPercentRemaining = 100) {
    // 100% → 更深綠漸層
    color1 = '#4caf50';
    color2 = '#388e3c';

    // 保證正常狀態時不殘留 alert-red class
  batteryFillElement.removeAttribute('class');
  } else if (budgetPercentRemaining > 50) {
    color1 = '#76ff03';
    color2 = '#4caf50';

    // 保證正常狀態時不殘留 alert-red class
  batteryFillElement.removeAttribute('class');
  } else if (budgetPercentRemaining > 20) {
    color1 = '#ffeb3b';
    color2 = '#fdd835';

    // 保證正常狀態時不殘留 alert-red class
  batteryFillElement.removeAttribute('class');
  } else if (budgetPercentRemaining >= 0){
    color1 = '#f44336';
    color2 = '#e53935';

    // 保證正常狀態時不殘留 alert-red class
  batteryFillElement.removeAttribute('class');
  }

    stops[0].setAttribute('stop-color', color1);
    stops[1].setAttribute('stop-color', color2);

    // 保證 batteryFillElement fill 用 gradient（避免前一次被改成單色）
    batteryFillElement.setAttribute('fill', 'url(#batteryGradient)');
  }

  //  產生年份列表
  generateYears(): void {
    const currentYear = new Date().getFullYear();
    const startYear = 1970;
    this.years = [];

    for(let y = currentYear; y >= startYear; y--) {
      this.years.push(y);
    }
  }

}
