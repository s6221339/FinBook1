import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-create-item',
  imports: [
    RouterOutlet,
    CommonModule,
    RouterModule,
    FormsModule,
],
  templateUrl: './create-item.component.html',
  styleUrl: './create-item.component.scss'
})
export class CreateItemComponent {
    // 固定主分類資料，對應資料庫表中的 type 欄位
  mainCategories = [
    { label: '飲食', value: 'food' },
    { label: '居家', value: 'Home organization' },
    { label: '消費', value: 'Consumption' },
    { label: '交通', value: 'transportation' },
    { label: '娛樂', value: 'entertainment' },
    { label: '醫療', value: 'medical' },
    { label: '美容', value: 'cosmetic' },
    { label: '其他', value: 'other' },

  ];

  // 儲存使用者選取的主分類值
  selectedCategory: string = '';

  // 暫存使用者新輸入的細項文字
  newSubItem: string = '';

  // 儲存已新增的細項資料，每筆資料包含：type、label 與 value
  subItems: {
id: any; type: string; label: string; value: string;
}[] = [];

  // 假設目前登入的使用者帳號；實際應由認證服務取得
  currentAccount: string = 'user@example.com';

  constructor(
    private router: Router,
    private http: HttpClient
  ){}

  /**
   * 新增細項方法：
   * 1. 檢查是否選擇主分類；若未選則提示。
   * 2. 檢查輸入是否有值；若無則終止。
   * 3. 產生標準化的細項名稱（value）。
   * 4. 於前端陣列中檢查同一主分類下是否有重複。
   * 5. 呼叫 API 檢查資料庫中是否已存在相同細項。
   * 6. 若無重複，呼叫 POST API 將資料存入資料庫，並更新前端列表。
   */
  addSubItem(): void {
    // 檢查是否選擇主分類
    if (!this.selectedCategory) {
      alert('請先選擇主分類');
      return;
    }
    // 檢查使用者輸入的新細項是否有值
    if (!this.newSubItem.trim()) {
      return;
    }

    const inputLabel = this.newSubItem.trim();
    const inputValue = inputLabel.toLowerCase().replace(/\s/g, '_');

    // 先檢查前端目前已新增的細項中，是否同一主分類下已包含相同名稱
    const localDuplicate = this.subItems.some(item =>
      item.type === this.selectedCategory &&
      (item.label.toLowerCase() === inputLabel.toLowerCase() || item.value === inputValue));
    if (localDuplicate) {
      alert('已在前端新增過相同的細項，請勿重複新增！');
      return;
    }

    // 呼叫 API 檢查資料庫是否有相同細項，假設 API 端點為 /subcategories/check
    // API URL 請自行替換成實際 URL
    const checkUrl = `https://api.example.com/subcategories/check?category=${this.selectedCategory}&item=${encodeURIComponent(inputLabel)}`;
    this.http.get<{ duplicate: boolean }>(checkUrl).subscribe({
      next: (result) => {
        if(result.duplicate) {
          // 若資料庫中已存在相同細項，提示使用者
          alert('資料庫中已存在相同細項！');
          return;
        } else {
          // 無重複，則準備新增細項資料
          const newData = {
            type: this.selectedCategory,
            item: inputLabel,
            account: this.currentAccount
          };
          // 呼叫 POST API 將資料存入資料庫（請替換 URL 為實際 API 端點）
          this.http.post<any>('https://api.example.com/subcategories', newData).subscribe({
            next: (res) => {
              // 假設後端回傳至少包含 item 欄位
              const newItem = {
                id: res.id || '',
                type: this.selectedCategory,
                label: res.item || newData.item,
                value: (res.item || newData.item).toLowerCase().replace(/\s/g, '_')
              };
              // 將新細項加入前端列表
              this.subItems.push(newItem);
              // 清空輸入框，方便下一次輸入
              this.newSubItem = '';
            },
            error: (err) => {
              console.error('新增細項 API 錯誤:', err);
            }
          });
        }
      },
      error: (err) => {
        console.error('檢查細項重複 API 錯誤:', err);
      }
    });
  }
}
