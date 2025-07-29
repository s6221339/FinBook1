import { AuthService } from './../../@services/auth.service';
import { ApiService } from './../../@services/api.service';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatIconModule } from "@angular/material/icon"

@Component({
  selector: 'app-publish-subscription',
  imports: [CommonModule, MatIconModule],
  templateUrl: './publish-subscription.component.html',
  styleUrl: './publish-subscription.component.scss',
  standalone: true
})
export class PublishSubscriptionComponent implements OnInit, OnDestroy{

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  subscriptionStatus: boolean = false;
  expirationDate: string = '';
  loading: boolean = true;

  private userSub?: Subscription;

  ngOnInit(): void {
    this.loading = true;

    //  ✅ 訂閱使用者資料變化，畫面自動刷新
    this.userSub = this.authService.currentUser$.subscribe(user => {
      if(user) {
        const account = user.account;

        this.authService.refreshUser(account);
        this.apiService.getSubscription(account)
          .then(res => {
            const result = res.data;

            if(result.code == 200 && result.data) {
              this.subscriptionStatus = result.data.subscription;
              this.expirationDate = result.data.expirationDate?.split('T')[0] || '';
            }
            else {
              this.subscriptionStatus = false;
              this.expirationDate = '';
            }
          })
          .catch(err => {
            console.error('取得訂閱資訊失敗', err);
            this.subscriptionStatus = false;
            this.expirationDate = '';
          })
          .finally(() => {
            this.loading = false;
          });
      }
      else{
        this.subscriptionStatus = false;
        this.expirationDate = '';
        this.loading = false;
      }
    });
  }

  subscribe(): void {
    const account = this.authService.getCurrentUser()?.account;
    if(!account) return;

    this.apiService.getECPayForm(account)
      .then(res => {
        const formData = res.data;

        //  🔽 建立動態 <form> 送出至綠界
        const form = document.createElement('form');
        form.method = 'POST';
        //  綠界測試網址
        form.action = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';

        for(const key in formData) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(formData[key]);
          form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
      })
      .catch(err => {
        console.error('取得綠界表單失敗', err);
        Swal.fire('❌ 金流初始化錯誤', '請檢察連線或稍後再試', 'error');
      });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

}
