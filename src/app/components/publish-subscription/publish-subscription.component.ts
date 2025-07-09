import { UserVO } from './../../models/userVO';
import { AuthService } from './../../@services/auth.service';
import { ApiService } from './../../@services/api.service';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-publish-subscription',
  imports: [CommonModule],
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
        this.subscriptionStatus = user.subscription == 'subscription';
        this.expirationDate = (user as any).expirationDate?.split('T')[0] || '';
      }
      else{
        this.subscriptionStatus = false;
        this.expirationDate = '';
      }

      this.loading = false;
    });
  }

  subscribe(): void {
    const account = this.authService.getCurrentUser()?.account;
    if(!account) return;

    this.apiService.renewal(account, true)
      .then(res => {
        if(res.data.code == 200) {
          window.open('https://payment.ecpay.com.tw', '_blank');

          this.authService.refreshUser(account)
            .then(() => {
              Swal.fire('✅ 訂閱成功', '畫面已同步刷新', 'success');
                // .then(() => this.router.navigate(['/home']));
            });
        }
        else{
          Swal.fire('⚠️ 訂閱失敗', res.data.message || '請稍後再試', 'warning');
        }
      })
      .catch(err => {
        console.error('訂閱失敗', err);
        Swal.fire('❌ 訂閱錯誤', '請檢查連線或稍後再試', 'error');
      });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

}
