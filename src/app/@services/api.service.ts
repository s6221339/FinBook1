import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor() { }

  //  創建帳款類型
  createType(data: any){
    return axios({
      url: 'http://localhost:8080/finbook/paymentType/create',
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
    return axios.post('http://localhost:8080/finbook/paymentType/getByAccount', null, {
      params: { account },
      withCredentials: true
    });
  }

  //  新增記帳款項
  createPayment(data: any){
    return axios({
      url: 'http://localhost:8080/finbook/payment/create',
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
    return axios.post('http://localhost:8080/finbook/payment/update', data, {
      withCredentials: true
    });
  }

  //  刪除記帳款項
  deletePayment(paymentId: number){
    return axios.post('http://localhost:8080/finbook/payment/delete', null, {
      params: { paymentId },
      withCredentials: true
    });
  }

  //  透過帳號得到所有帳款資料
  getPaymentByAccount(account: string){
    return axios.post('http://localhost:8080/finbook/payment/getInfoByAccount', null, {
      params: { account },
      withCredentials: true
    });
  }

  //  透過帳號取得特定月份預算
  getBudgetByAccount(data: any){
    return axios.post('http://localhost:8080/finbook/balance/getBudgetByAccount', data, {
      withCredentials: true
    });
  }

}
