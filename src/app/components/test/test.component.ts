import { ApiService } from './../../@services/api.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  imports: [],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {

  constructor(
    private apiService: ApiService
  ){}

  data = {
    "type":"飲食",
    "item":"吃烤羊排",
    "account":"a6221339"
  };
  account: string = "a6221339";
  data1 = {
    "balanceId": 1,
    "description": "測試",
    "type": "收入",
    "item": "（轉帳）轉入",
    "amount": 6000,
    "recurringPeriod": {
      "year": 0,
      "month": 0,
      "day": 0
    },
    "recordDate": "2025-06-13"
  };
  data2 = {
 "paymentId": 15,
 "description": "肚子餓",
 "type": "飲食",
 "item": "早餐",
 "amount": 55,
 "recurringPeriod":
 {
  "year": 0,
  "month": 0,
  "day": 0
 },
 "recordDate": "2025-06-09"
};
paymentId: number = 2;
data3 = {
  "account": "a6221339",
  "year": 2025,
  "month": 6
};
data4 = {
  "balanceId": 1,
  "name": "",
  "savings": 3000
};
data5 = {
  "account": "a6221339",
  "year": 2025,
  "month": 6
};

  createType(){
    this.apiService.createType(this.data)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('帳款類型建立成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('建立帳款類型失敗，請稍後再試');
      });
  }

  getTypeByAccount(){
    this.apiService.getTypeByAccount(this.account)
    .then(res => {
    const PaymentTypeList = res.data; // 這裡才是後端傳來的資料
    console.log('問卷列表：', PaymentTypeList);
    alert('取得帳款類型成功！');
  })
  .catch(err => {
    console.error('取得問卷失敗：', err);
    alert('取得帳款類型失敗！');
  });
  }

  createPayment(){
    this.apiService.createPayment(this.data1)
      .then(res => {
        console.log('成功送出：', res.data);
        alert('帳款建立成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('建立帳款失敗，請稍後再試');
      });
  }

  updatePayment(){
    this.apiService.updatePayment(this.data2)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('編輯帳款成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('編輯帳款失敗，請稍後再試');
      });
  }

  deletePayment(){
    this.apiService.deletePayment(this.paymentId)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('刪除帳款成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('刪除帳款失敗，請稍後再試');
      });
  }

  getPaymentByAccount(){
    this.apiService.getPaymentByAccount(this.account)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('獲得帳款成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('獲得帳款失敗，請稍後再試');
      });
  }

  getBudgetByAccount(){
    this.apiService.getBudgetByAccount(this.data3)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('獲得特定月預算成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('獲得特定月預算失敗，請稍後再試');
      });
  }

  updateSavings(){
    this.apiService.updateSavings(this.data4)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('更新存款成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('更新存款失敗，請稍後再試');
      });
  }

  getPaymentByAccountAndMonth(){
    this.apiService.getPaymentByAccountAndMonth(this.data5)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('取得帳款成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('取得帳款失敗，請稍後再試');
      });
  }

  getBalanceByAccount(){
    this.apiService.getBalanceByAccount(this.account)
    .then(res => {
      const BalanceList = res.data; // 這裡才是後端傳來的資料
      console.log('帳戶列表：', BalanceList);
      alert('取得個人帳號帳戶成功！');
    })
    .catch(err => {
      console.error('取得帳戶失敗：', err);
      alert('取得個人帳號帳戶失敗！');
    });
  }

}
