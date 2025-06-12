import { Injectable } from '@angular/core';
import axios from 'axios';
import { Account, ApiResponse, Transfer, TransferRequest } from '../models/transfers'; // 預設

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor() { }

  //  創建帳款類型
  createType(data: any){
    return axios({
      url: 'http://localhost:8080/finbook/createType',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true,
      data
    });
  }

  //  帳款類型應用帳號
  getTypeByAccount(account: string){
    return axios.post('http://localhost:8080/finbook/getType', null, {
      params: { account },
      withCredentials: true
    });
  }

  //  新增記帳款項
  createPayment(data: any){
    return axios({
      url: 'http://localhost:8080/finbook/createPayment',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true,
      data
    });
  }

  //  編輯記帳款項
  updatePayment(data: any){
    return axios.post('http://localhost:8080/finbook/updatePayment', data, {
      withCredentials: true
    });
  }

  //  刪除記帳款項
  deletePayment(paymentId: number){
    return axios.post('http://localhost:8080/finbook/deletePayment', null, {
      params: { paymentId },
      withCredentials: true
    });
  }

  //  透過帳號得到所有帳款資料
  getPaymentByAccount(account: string){
    return axios.post('http://localhost:8080/finbook/getPaymentInfoByAccount', null, {
      params: { account },
      withCredentials: true
    });
  }






  // 預設預設預設預設預設預設預設預設預設預設預設預設預設預設預設預設
    // 登入會員後給所有頁面用
  getAccountsRaw() {
    // 取得帳戶列表
    return axios.get(`'http://localhost:8080/finbook/accounts`, {
      withCredentials: true
    });
  }

    // 新增轉帳紀錄
  createTransferRaw(data: any){
    return axios.post(
      `'http://localhost:8080/finbook/transfers`,data,
      { withCredentials: true }
    );
  }
}
