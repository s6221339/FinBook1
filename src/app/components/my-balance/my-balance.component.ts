import { Balance } from '../../models/Balance';
import { ApiService } from './../../@services/api.service';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-my-balance',
  standalone: true,
  imports: [],
  templateUrl: './my-balance.component.html',
  styleUrl: './my-balance.component.scss'
})
export class MyBalanceComponent implements OnInit{

  constructor(
    private apiService: ApiService
  ){}

  account: string= 'a6221339';
  balanceList: Balance[] = [];
  familyId: number = 0;

  ngOnInit(): void {
    this.apiService.getBalanceByAccount(this.account)
    .then(res => {
      this.balanceList = res.data.balanceList || [];
    })
    .catch(err => {
      console.error('取得帳戶失敗', err);
      alert('無法載入帳戶，請稍後再試');
    });
  }

  onCreateBalance(): void {
    Swal.fire({
      title: '請輸入帳戶名稱',
      input: 'text',
      inputLabel: '帳戶名稱',
      inputPlaceholder: '例如：日常帳戶、生活支出...',
      showCancelButton: true,
      confirmButtonText: '建立帳戶',
      cancelButtonText: '取消',
      inputValidator: (value) => {
        if(!value){
          return '帳戶名稱不得為空';
        }
        return null;
      }
    })
    .then(result => {
      if(result.isConfirmed){
        const name = result.value;

        const payload = {
          familyId: this.familyId,
          account: this.account,
          name: name
        };

        this.apiService.createBalance(payload)
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: '帳戶已建立',
            confirmButtonText: '確定'
          });

          //  重新載入帳戶清單
          return this.apiService.getBalanceByAccount(this.account);
        })
        .then(res => {
          this.balanceList = res.data.balanceList || [];
        })
        .catch(err => {
          console.error('帳戶創建失敗', err);
          Swal.fire({
            icon: 'error',
            title: '創建失敗',
            text: '請稍後再試',
            confirmButtonText: '關閉'
          });
        });
      }
    });
  }

  onDeleteBalance(): void {
    //  第一步：請輸入 balanceId
    Swal.fire({
      title: '請輸入要刪除的帳號',
      input: 'number',
      inputLabel: '帳戶 ID',
      inputPlaceholder: '請輸入帳戶 ID',
      showCancelButton: true,
      confirmButtonText: '下一步',
      cancelButtonText: '取消',
      inputValidator: (value) => {
        if(!value || isNaN(Number(value))) {
          return '請輸入有效的數字 ID';
        }
        return null;
      }
    })
    .then(firstResult => {
      if(firstResult.isConfirmed) {
        const balanceIdToDelete = Number(firstResult.value);

        //  判斷 balanceId 是否存在於目前清單中
        const found = this.balanceList.find(b => b.balanceId == balanceIdToDelete);
        if(!found) {
          Swal.fire({
            icon: 'error',
            title: '找不到此帳戶',
            text: `ID ：${balanceIdToDelete} 不存在，請重新確認`,
            confirmButtonText: '關閉'
          });
          return;
        }

        //  產生隨機驗證碼（S 碼英數混合）
        const verificationCode = Math.random().toString(36).substring(2, 7).toUpperCase();

        //  第二步：要求使用者輸入驗證碼
        Swal.fire({
          title: '確認刪除',
          html: `請輸入下方驗證碼以確認刪除帳戶：<br><strong style="font-size: 24px;">${verificationCode}</strong>`,
          input: 'text',
          inputPlaceholder: '請輸入上方驗證碼',
          showCancelButton: true,
          confirmButtonText: '確認刪除',
          cancelButtonText: '取消',
          preConfirm: (inputCode) => {
            if(inputCode.toUpperCase() !== verificationCode) {
              Swal.showValidationMessage('驗證碼輸入錯誤');
            }
          }
        })
        .then(secondResult => {
          if(secondResult.isConfirmed) {
            //  驗證通過，開始刪除
            this.apiService.deleteBalance(balanceIdToDelete)
            .then(() => {
              Swal.fire({
                icon: 'success',
                title: '帳戶已成功刪除',
                confirmButtonText: '確定'
              });

              //  刷新帳戶列表
              return this.apiService.getBalanceByAccount(this.account);
            })
            .then(res => {
              this.balanceList = res.data.balanceList || [];
            })
            .catch(err => {
              console.error('刪除失敗', err);
              Swal.fire({
                icon: 'error',
                title: '刪除失敗',
                text: '請稍後再試',
                confirmButtonText: '關閉'
              });
            });
          }
        });
      }
    });
  }

}
