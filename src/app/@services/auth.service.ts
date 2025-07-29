import { UserVO } from './../models/userVO';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';

//  LocalStorage 中儲存目前使用者資訊的 key 名稱
const STORAGE_KEY = 'currentUser';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //  當前登入會員狀態
  private currentUserSubject: BehaviorSubject<UserVO | null>;

  //  提供外部訂閱用 observable
  currentUser$!: Observable<UserVO | null>;

  constructor(private apiService: ApiService) {
    //  初始化時常是從 LocalStorage 中取得登入資訊
    const savedUser = localStorage.getItem(STORAGE_KEY);

    let parsedUser: UserVO | null = null;

    try {
      parsedUser = savedUser && savedUser !== 'undefined'
        //  將 localStorage 中取出的文字轉成 JSON 物件（ UserVO ）
        ? JSON.parse(savedUser) as UserVO
        : null;
    } catch (e) {
      //  若 JSON 格式不為 UserVO 則清除 localStorage
      console.warn('⚠️ localStorage currentUser 格式錯誤，已清除');
      localStorage.removeItem(STORAGE_KEY);
    }

    this.currentUserSubject = new BehaviorSubject<UserVO | null>(parsedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * 執行登入流程
   * @param account 帳號
   * @param password 密碼
   * @returns Observable<boolean> 代表登入是否成功
   */
  login(account: string, password: string): Observable<boolean> {
    //  Observable<boolean> 多次性非同步操作結果
    return new Observable<boolean>(observer => {
      const loginData = { account, password };

      this.apiService.login(loginData)
        .then(res => {
          if(res.data.code == 200) {
            //  再取得使用者資料
            this.apiService.getUserByAccount(account)
              .then(userRes => {
                if(userRes.data.code == 200) {
                  const user = userRes.data.userVO;
                  this.currentUserSubject.next(user);
                  //  存入 localStorage
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
                  observer.next(true);
                }
                else{
                  observer.next(false);
                }
                observer.complete();
              })
              .catch(err => {
                console.error('取得會員資料失敗', err);
                observer.next(false);
                observer.complete();
              });
          }
          else{
            observer.next(false);
            observer.complete();
          }
        })
        .catch(err => {
          console.error('登入失敗', err);
          observer.next(false);
          observer.complete();
        });
    });
  }

  /**
   * 登出使用者，包含 API 與前端狀態清除
   * @returns Observable<boolean> 登出是否成功（永遠回 true）
   */
  logout(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.apiService.logout()
        .then(() => {
          //  不論是否 code 200，都照樣清除前端狀態
          this.currentUserSubject.next(null);
          localStorage.removeItem(STORAGE_KEY);
          observer.next(true);  //  總是視為登出成功
          observer.complete();
        })
        .catch(err => {
          console.warn('登出失敗，可能是後端 session 遺失', err);
          //  仍然清除前端狀態
          this.currentUserSubject.next(null);
          localStorage.removeItem(STORAGE_KEY);
          observer.next(true);  //  一樣視為登出成功
          observer.complete();
        });
    });
  }

  /**
   * 更新會員資料並同步到 LocalStorage
   * @param user 更新後的使用者資訊
   * @returns Promise<boolean> 是否成功更新
   */
  updateMemberInfo(user: UserVO): Promise<boolean> {
    //  Promise<boolean> 一次性非同步結果
    return this.apiService.updateMemberInformation(user)
      .then(res => {
        if(res.data.code == 200) {
          this.currentUserSubject.next(user);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          return true;
        }
        return false;
      })
      .catch(err => {
        console.error('更新會員資料失敗', err);
        return false;
      });
  }

  /**
   * 僅更新本地端使用者狀態（不打 API）
   * @param user 使用者資料
   */
  updateLocalUser(user: UserVO) {
    this.currentUserSubject.next(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  /**
   * 是否登入
   * @returns true 表示已登入，false 表示未登入
   */
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * 判斷是否為管理員
   * @returns true 表示為 admin 身分
   */
  isAdmin(): boolean {
    return this.currentUserSubject.value?.role == 'admin';
  }

  /**
   * 取得目前使用者資訊（同步取值，不須訂閱）
   * @returns 使用者資訊或 null
   */
  getCurrentUser(): UserVO | null {
    return this.currentUserSubject.value;
  }

  /**
   * 重新從後端取得使用者資料，並同步更新 LocalStorage
   * @param account 帳號
   * @returns Promise<void> 無回傳值
   */
  refreshUser(account: string): Promise<void> {
    return this.apiService.getUserByAccount(account)
      .then(res => {
        if(res.data.code == 200) {
          const rawUser = res.data.userVO;

          const user: UserVO = {
            ...rawUser,
            avatar: rawUser.avatar || null,
            // ✅ 強制轉換為預期格式
            role: rawUser.role === 'admin' ? 'admin' : 'user',
            subscription: !!rawUser.subscription ? 'subscribed' : 'unsubscribed',
            expirationDate: rawUser.expirationDate || null
          };

          this.currentUserSubject.next(user);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        }
      });
  }

}
