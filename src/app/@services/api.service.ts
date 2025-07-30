import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';
import { PaymentTypeCreateRequest } from '../models/request/PaymentTypeCreateRequest';
import { BasicResponse } from '../models/response/basicResponse';
import { GetPaymentTypeByAccountResponse } from '../models/response/getPaymentTypeByAccountResponse';
import { PaymentCreateRequest } from '../models/request/paymentCreateRequest';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  /**
   * 建立帳款類型
   * 需登入：系統需附帶 cookie，否則將回傳 401
   * @param data type、item、account 組成的資料
   * @returns Axios 回傳 Promise<AxiosResponse<BasicResponse>> 基本回傳資料
   */
  createType(data: PaymentTypeCreateRequest): Promise<AxiosResponse<BasicResponse>>{
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

  /**
  * 根據帳號取得所有帳款類型及細項
  * 需登入：系統需附帶 cookie，否則將回傳 401
  * @param account 使用者帳號
  * @returns Axios 回傳 Promise<AxiosResponse<GetPaymentTypeByAccountResponse>> 回傳類型清單
  */
  getTypeByAccount(account: string): Promise<AxiosResponse<GetPaymentTypeByAccountResponse>> {
    return axios.post('http://localhost:8080/finbook/paymentType/getByAccount', null, {
      params: { account },
      withCredentials: true
    });
  }

  /**
  * 新增記帳款項
  * 需登入：系統需附帶 cookie，否則將回傳 401
  * @param data 記帳款項請求資料（包含帳戶、描述、金額、分類等）
  * @returns Axios 回傳 Promise<AxiosResponse<BasicResponse>> 基本回傳結果
  */
  createPayment(data: PaymentCreateRequest): Promise<AxiosResponse<BasicResponse>> {
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

  //  獲得已加入家庭列表
  getFamilyByAccount(account: string){
    return axios.post('http://localhost:8080/finbook/user/getFamilyByAccount', null, {
      params: { account },
      withCredentials: true
    });
  }

  //  登入會員
  login(data: any){
    return axios.post('http://localhost:8080/finbook/user/login', data, {
      withCredentials: true
    });
  }

  //  取得帳號名稱
  getNameByAccount(account: string){
    return axios.post('http://localhost:8080/finbook/user/getNameByAccount', null, {
      params: { account },
      withCredentials: true
    });
  }

  //  創建家庭
  createFamily(data: any) {
    return axios.post('http://localhost:8080/finbook/family/create', data, {
      withCredentials: true
    });
  }

  //  更改家庭名稱
  renameFamily(data: any) {
    return axios.post('http://localhost:8080/finbook/family/rename', data, {
      withCredentials: true
    });
  }

  //  踢除家庭成員
  removeFamilyMember(data: any) {
    return axios.post('http://localhost:8080/finbook/family/kick', data, {
      withCredentials: true
    });
  }

  //  邀請家庭成員
  inviteFamilymember(data: any) {
    return axios.post('http://localhost:8080/finbook/family/invite', data, {
      withCredentials: true
    });
  }

  //  轉讓家庭族長
  transferOwner(data: any) {
    return axios.post('http://localhost:8080/finbook/family/transferOwner', data, {
      withCredentials: true
    });
  }

  //  解散家庭
  disbandFamily(data: any) {
    return axios.post('http://localhost:8080/finbook/family/dismiss', data, {
      withCredentials: true
    });
  }

  //  顯示家庭成員邀請中清單
  getUnacceptedFamilyInvitation(familyId: number) {
    return axios.post('http://localhost:8080/finbook/family/getInvitingList', null, {
      params: { familyId },
      withCredentials: true
    });
  }

  //  退出家庭
  leaveFamily(data: any) {
    return axios.post('http://localhost:8080/finbook/family/quit', data, {
      withCredentials: true
    });
  }

  //  取消待邀請家庭成員
  cancelPendingInvitation(familyId: number, owner: string, invitee: string) {
    return axios.post('http://localhost:8080/finbook/family/cancelInvite', null, {
      params: { familyId, owner, invitee },
      withCredentials: true
    });
  }

  //  顯示帳號家庭邀請
  getFamilyInvitationByAccount(account: string) {
    return axios.post('http://localhost:8080/finbook/family/getInvitationStatus', null, {
      params: { account },
      withCredentials: true
    });
  }

  //  接受家庭邀請
  acceptFamilyInvitation(data: any) {
    return axios.post('http://localhost:8080/finbook/family/acceptInvite', data, {
      withCredentials: true
    });
  }

  //  拒絕家庭邀請
  rejectFamilyInvitation(data: any) {
    return axios.post('http://localhost:8080/finbook/family/rejectInvite', data, {
      withCredentials: true
    });
  }

  //  會員登出
  logout() {
    return axios.post('http://localhost:8080/finbook/user/logout', null, {
      withCredentials: true
    });
  }

  //  獲得會員資料
  getUserByAccount(account: string) {
    return axios.post('http://localhost:8080/finbook/user/getUser', null, {
      params: { account },
      withCredentials: true
    });
  }

  //  獲得統計資料
  getStatistics(data: any) {
    return axios.post('http://localhost:8080/finbook/payment/statistics', data, {
      withCredentials: true
    });
  }

  //  編輯會員資料
  updateMemberInformation(data: any) {
    return axios.post('http://localhost:8080/finbook/user/update', data, {
      withCredentials: true
    });
  }

  //  修改會員密碼
  updateUserPassword(data: any) {
    return axios.post('http://localhost:8080/finbook/user/updatePasswordUser', data, {
      withCredentials: true
    });
  }

  //  發送忘記密碼驗證碼
  sendVerificationCode(account: string) {
    return axios.post('http://localhost:8080/finbook/userVerifyCode/sendVerifyCode', null, {
      params: { account },
      withCredentials: true
    });
  }

  //  認證忘記密碼驗證碼
  checkVerificationCode(code: string, account: string) {
    return axios.post('http://localhost:8080/finbook/userVerifyCode/checkVerifyCode', null, {
      params: { code, account },
      withCredentials: true
    });
  }

  //  忘記密碼-修改密碼
  updatePasswordByEmail(data: any) {
    return axios.post('http://localhost:8080/finbook/userVerifyCode/updatePwdByEmail', data, {
      withCredentials: true
    });
  }

  //  刪除帳號
  deleteAccount(account: string) {
    return axios.post('http://localhost:8080/finbook/user/cancel', null, {
      params: { account },
      withCredentials: true
    });
  }

  //  獲得存在帳戶每個月總收支
  getMonthlyIncomeExpenseSummary(data: any) {
    return axios.post('http://localhost:8080/finbook/payment/statistics/summaryIncomeAndOutlay', data, {
      withCredentials: true
    });
  }

  //  獲得所有帳戶每個月所有類型收支
  getAccountTypeMonthlySummary(data: any) {
    return axios.post('http://localhost:8080/finbook/payment/statistics/personalBalanceWithPaymentType', data, {
      withCredentials: true
    });
  }

  //  發送註冊會員驗證碼
  sendRegistrationVerificationCode(account: string) {
    return axios.post('http://localhost:8080/finbook/userVerifyCode/sendRegisterVerifyCode', null, {
      params: { account },
      withCredentials: true
    });
  }

  //  驗證註冊會員驗證碼
  verifyRegistrationVerificationCode(code: string, account: string) {
    return axios.post('http://localhost:8080/finbook/userVerifyCode/checkRegisterVerifyCode', null, {
      params: { code, account },
      withCredentials: true
    });
  }

  //  會員註冊
  register(data: any) {
    return axios.post('http://localhost:8080/finbook/user/register', data, {
      withCredentials: true
    });
  }

  //  續訂
  renewal(account: string, subscription: boolean) {
    return axios.post('http://localhost:8080/finbook/user/updateSubscription', null, {
      params: { account, subscription },
      withCredentials: true
    });
  }

  //  查詢訂閱資訊
  getSubscription(account: string) {
    return axios.post('http://localhost:8080/finbook/user/getSubscription', null, {
      params: { account },
      withCredentials: true
    });
  }

  //  獲得所有帳戶的收入與支出
  getIncomeAndExpenseByMonthAndYear(data: any) {
    return axios.post('http://localhost:8080/finbook/payment/statistics/incomeAndOutlayWithAllBalance', data, {
      withCredentials: true
    });
  }

  //  獲得每月所有帳戶收入細項佔比
  getAccountIncomeItemByMonthAndYear(data: any) {
    return axios.post('http://localhost:8080/finbook/payment/statistics/incomeDetailsSummarize', data, {
      withCredentials: true
    });
  }

  //  取得綠界金流付款表單欄位
  getECPayForm(account: string) {
    return axios.post('http://localhost:8080/finbook/user/getECPayForm', null, {
      params: { account },
      withCredentials: true
    });
  }

  //  取得帳號的所有家庭帳戶
  getFamilyBalanceByAccount(account: string) {
    return axios.post('http://localhost:8080/finbook/balance/getAllByFamily', null, {
      params: { account },
      withCredentials: true
    });
  }

  //  取得家庭帳戶特定月份帳款
  getMonthlyPaymentByFamiltBalance(data: any) {
    return axios.post('http://localhost:8080/finbook/payment/getInfoOfFamilyWithDateFilter', data, {
      withCredentials: true
    });
  }

}
