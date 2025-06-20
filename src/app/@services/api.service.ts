import { Injectable } from '@angular/core';
import axios from 'axios';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor() {}

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

  //  更新儲蓄金額
  updateSavings(data: any){
    return axios.post('http://localhost:8080/finbook/balance/update', data, {
      withCredentials: true
    });
  }

  //  獲取當月所有帳款
  getPaymentByAccountAndMonth(data: any){
    return axios.post('http://localhost:8080/finbook/payment/getInfoByAccountWithDateFilter', data, {
      withCredentials: true
    });
  }

  //  透過帳號取得個人帳號帳戶
  getBalanceByAccount(account: string){
    return axios.post('http://localhost:8080/finbook/balance/getAllByAccount', null, {
      params: { account },
      withCredentials: true
    });
  }

  //  新增轉帳紀錄
  createTransfers(data: any){
    return axios({
      url: 'http://localhost:8080/finbook/transfers/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true,
      data
    });
  }

  //  管理員刪除轉帳紀錄
  deleteTransfers(account: string, id: number){
    return axios.post('http://localhost:8080/finbook/transfers/delete', null, {
      params: { account, id },
      withCredentials: true
    });
  }

  //  清除無用轉帳紀錄
  deleteUselessTransfers(from: number, to: number){
    return axios.post('http://localhost:8080/finbook/transfers/deleteByBalanceId', null, {
      params: { from, to },
      withCredentials: true
    });
  }

  //  帳戶獲得所有轉帳紀錄
  getAllTransfersByBalanceId(balanceId: number){
    return axios.post('http://localhost:8080/finbook/transfers/getAll', null, {
      params: { balanceId },
      withCredentials: true
    });
  }

  //  透過帳號取得所有帳戶儲蓄金額
  getSavingsByAccount(account: string){
    return axios.post('http://localhost:8080/finbook/savings/getAll', null, {
      params: { account },
      withCredentials: true
    });
  }

  //  獲得待刪資料
  getPaymentInPendingDeletion(account: string){
    return axios.post('http://localhost:8080/finbook/payment/trashCan', null, {
      params: { account },
      withCredentials: true
    });
  }

  //  還原已刪除帳款
  recoveryPayments(paymentIdList: number[]){
    return axios.post('http://localhost:8080/finbook/payment/recovery', {
      paymentIdList
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
  }

  //  創建帳戶
  createBalance(data: any){
    return axios.post('http://localhost:8080/finbook/balance/create', data, {
      withCredentials: true
    });
  }

  //  刪除帳戶
  deleteBalance(balanceId: number){
    return axios.post('http://localhost:8080/finbook/balance/delete', null, {
      params: { balanceId },
      withCredentials: true
    });
  }

}


