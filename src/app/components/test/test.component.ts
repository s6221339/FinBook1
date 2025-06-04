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
    "account":"s6221339"
  };

  account: string = "s6221339";

  createType(){
    this.apiService.createType(this.data)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('問卷建立成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('建立問卷失敗，請稍後再試');
      });
  }

  getTypeByAccount(){
    this.apiService.getTypeByAccount(this.account)
    .then(res => {
    const PaymentTypeList = res.data; // 這裡才是後端傳來的資料
    console.log('問卷列表：', PaymentTypeList);
    alert('取得問卷資料成功！');
  })
  .catch(err => {
    console.error('取得問卷失敗：', err);
    alert('取得問卷資料失敗！');
  });
  }

}
