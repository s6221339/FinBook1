import { Balance } from '../../models/Balance';
import { ApiService } from './../../@services/api.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-balance',
  standalone: true,
  imports: [],
  templateUrl: './my-balance.component.html',
  styleUrl: './my-balance.component.scss'
})
export class MyBalanceComponent implements OnInit{

  constructor(
    private apiService: ApiService
  ){}

  account: string= 'a6221339';
  balanceList: Balance[] = [];

  ngOnInit(): void {
    this.apiService.getBalanceByAccount(this.account)
    .then(res => {
      this.balanceList = res.data.balanceList || [];
    })
    .catch(err => {
      console.error('取得帳戶失敗', err);
      alert('無法載入帳戶，請稍後再試');
    });
  }

}
