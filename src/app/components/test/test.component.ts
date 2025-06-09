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
    "item":"吃大餐",
    "account":"a6221339"
  };
  account: string = "a6221339";
  data1 = {
    "balanceId": 1,
    "description": "6/5晚餐",
    "type": "飲食",
    "item": "晚餐",
    "amount": 140,
    "recurringPeriodYear": null,
    "recurringPeriodMonth": null,
    "recurringPeriodDay": null,
    "recordDate": "2025-06-05"
  };
  data2 = {
 "paymentId": 1,
 "description": "更新備註",
 "type": "居家",
 "item": "水電費",
 "amount": 1500,
 "recurringPeriod":
 {
  "year": 0,
  "month": 0,
  "day": 0
 },
 "recordDate": "2025-06-03"
};
paymentId: number = 2;

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
}
