import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MemberdataService, MemberData } from '../../@services/memberdata.service'; // 導入服務和介面


@Component({
  selector: 'app-member-info',
  imports: [FormsModule,ReactiveFormsModule],
  standalone: true,
  templateUrl: './member-info.component.html',
  styleUrl: './member-info.component.scss'
})
export class MemberInfoComponent {
  // 表單組
  memberInfoForm!: FormGroup; // 使用 '!' 斷言它會在 ngOnInit 中被初始化


  // 生日選擇器相關屬性
  years: number[] = [];
  months: number[] = [];
  days: number[] = [];

   // 綁定選中的值
  selectedYear: number | null = null;
  selectedMonth: number | null = null;
  selectedDay: number | null = null;

  constructor(private router: Router , private fb: FormBuilder,private memberdataService: MemberdataService) { }

  ngOnInit(): void {

    this.memberInfoForm = this.fb.group({
      name: ['我很帥', Validators.required], // 姓名欄位設為必填
      // gender: ['male'], // 如果性別移除，這裡也要移除

      // 手機號碼欄位及其驗證規則
      phoneNumber: [
        '0912345678', // 預設值
        [
          Validators.required, // 必填
          Validators.pattern(/^09-\d{8}$/) // 正則表達式驗證：09- 後面接 8 個數字
        ]
      ],
      // birthday 相關欄位，我們仍然用現有的 selectedYear/Month/Day
      // 但如果想完全納入 Reactive Forms，可以這樣定義：
      // dobYear: [this.selectedYear, Validators.required],
      // dobMonth: [this.selectedMonth, Validators.required],
      // dobDay: [this.selectedDay, Validators.required]
    });

    this.generateYears();
    this.generateMonths();
    // 預設選中當前年份、月份和當月第一天
    const today = new Date();
    this.selectedYear = today.getFullYear();
    this.selectedMonth = today.getMonth() + 1; // 月份從 0 開始，所以加 1
    this.selectedDay = 1; // 預設選中 1 號

    this.onDateChange(); // 初始化時呼叫一次，確保日期正確

    // 監聽手機號碼欄位的值變化，並進行格式化 (可選，提供更好的使用者體驗)
    this.memberInfoForm.get('phoneNumber')?.valueChanges.subscribe(value => {
      const formattedValue = this.formatPhoneNumber(value);
      if (value !== formattedValue) {
        // 使用 patchValue 更新值，並設置 emitEvent: false 防止無限循環
        this.memberInfoForm.get('phoneNumber')?.patchValue(formattedValue, { emitEvent: false });
      }
    });
  }

  // 手機號碼格式化函數
  formatPhoneNumber(value: string): string {
    if (!value) return '';

    // 移除所有非數字和非 '-' 的字元
    let cleanValue = value.replace(/[^\d-]/g, '');

    // 移除重複的 '-'
    cleanValue = cleanValue.replace(/--+/g, '-');

    // 如果開頭是 09 且後面沒有 '-', 則自動添加 '-'
    if (cleanValue.startsWith('09') && cleanValue.length > 2 && cleanValue.charAt(2) !== '-') {
        cleanValue = '09-' + cleanValue.substring(2);
    }

    // 限制格式為 09-xxxxxxxx (x 為數字)
    if (cleanValue.startsWith('09-')) {
        let numbersPart = cleanValue.substring(3).replace(/[^\d]/g, ''); // 僅保留數字部分
        if (numbersPart.length > 8) {
            numbersPart = numbersPart.substring(0, 8); // 限制為 8 位數字
        }
        return `09-${numbersPart}`;
    } else if (cleanValue.startsWith('09')) {
        let numbersPart = cleanValue.substring(2).replace(/[^\d]/g, '');
        if (numbersPart.length > 8) {
            numbersPart = numbersPart.substring(0, 8); // 限制為 8 位數字
        }
        return `09${numbersPart}`; // 如果還沒有 '-'，暫時不加
    } else {
        // 如果不是以 09 開頭，則只允許數字和一個 '-'
        return cleanValue;
    }

  }

  // 生成年份 (例如 1900 到當前年份)
  generateYears(): void {
    const currentYear = new Date().getFullYear();
    for (let i = 1900; i <= currentYear; i++) {
      this.years.push(i);
    }
  }

  // 生成月份 (1 到 12)
  generateMonths(): void {
    for (let i = 1; i <= 12; i++) {
      this.months.push(i);
    }
  }

  // 當年份或月份改變時，重新計算天數
  onDateChange(): void {
    const year = this.selectedYear;
    const month = this.selectedMonth;

    if (year !== null && month !== null) {
      // 獲取該月的天數
      // Date(year, month, 0) 會給出上一個月的最後一天，其日期就是當月的天數
      const daysInMonth = new Date(year, month, 0).getDate();
      this.days = []; // 清空現有天數
      for (let i = 1; i <= daysInMonth; i++) {
        this.days.push(i);
      }
      // 如果選中的日期超出了新月份的最大天數，則將其設置為新月份的最後一天
      if (this.selectedDay !== null && this.selectedDay > daysInMonth) {
        this.selectedDay = daysInMonth;
      }
    } else {
      // 如果年或月沒有選中，預設顯示1-31天
      this.days = [];
      for (let i = 1; i <= 31; i++) {
        this.days.push(i);
      }
    }
  }

  onSaveClick(): void {
    if (this.memberInfoForm.valid) {
      const memberData: MemberData = {
        name: this.memberInfoForm.get('name')?.value,
        dobYear: this.selectedYear,
        dobMonth: this.selectedMonth,
        dobDay: this.selectedDay,
        phoneNumber: this.memberInfoForm.get('phoneNumber')?.value
      };

      this.memberdataService.updateMemberData(memberData);

      console.log('表單有效，資料已傳遞至服務。');
      console.log('傳遞的資料:', memberData);


      this.router.navigate(['/memberCenter/memberConfirm']);
    } else {
      console.log('表單無效，請檢查輸入。');
      this.memberInfoForm.markAllAsTouched();
    }
  }



}
