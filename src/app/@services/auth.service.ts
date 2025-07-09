import { UserVO } from './../models/userVO';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';

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
    const savedUser = localStorage.getItem(STORAGE_KEY);

    let parsedUser: UserVO | null = null;

    try {
      parsedUser = savedUser && savedUser !== 'undefined'
        ? JSON.parse(savedUser) as UserVO
        : null;
    } catch (e) {
      console.warn('⚠️ localStorage currentUser 格式錯誤，已清除');
      localStorage.removeItem(STORAGE_KEY);
    }

    this.currentUserSubject = new BehaviorSubject<UserVO | null>(parsedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  //  登入
  login(account: string, password: string): Observable<boolean> {
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

  //  登出
  logout(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.apiService.logout()
        .then(res => {
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

  updateMemberInfo(user: UserVO): Promise<boolean> {
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

  updateLocalUser(user: UserVO) {
    this.currentUserSubject.next(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  //  判斷是否登入
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  //  是否為管理員
  isAdmin(): boolean {
    return this.currentUserSubject.value?.role == 'admin';
  }

  //  不訂閱能拿到即時的值
  getCurrentUser(): UserVO | null {
    return this.currentUserSubject.value;
  }

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
            subscription: rawUser.subscription === 'subscription' ? 'subscription' : 'unSubscription',
            expirationDate: rawUser.expirationDate || null
          };

          this.currentUserSubject.next(user);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        }
      });
  }

}
