import { ApiService } from './../../@services/api.service';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-family',
  imports: [FormsModule],
  templateUrl: './create-family.component.html',
  styleUrl: './create-family.component.scss',
  standalone: true
})
export class CreateFamilyComponent implements OnInit{

  constructor(
    private router: Router,
    private apiService: ApiService
  ){}

  account: string = "a6221339@yahoo.com.tw";
  creatorName: string = "載入中...";
  familyName: string = '';
  invitedMenbers: { name: string; account: string }[] = [];

  ngOnInit(): void {
    this.apiService.getNameByAccount(this.account)
    .then(res => {
      if(res.data.code == 200) {
        this.creatorName = res.data.memberData.name;
      }
      else{
        this.creatorName = "查無此帳號名稱";
      }
    })
    .catch(err => {
      console.error("取得創建者名稱失敗", err);
      this.creatorName = "取得失敗";
    });
  }

  addMember(): void {
    Swal.fire({
      title: '輸入要新增的帳號',
      input: 'text',
      inputPlaceholder: '請輸入帳號',
      showCancelButton: true,
      confirmButtonText: '查詢',
      cancelButtonText: '取消'
    })
    .then(result => {
      if(result.isConfirmed && result.value) {
        const inputAccount = result.value.trim();

        //  防呆：不能邀請自己
        if(inputAccount == this.account){
          Swal.fire('錯誤', '無法邀請自己加入家庭群組', 'warning');
          return;
        }

        this.apiService.getNameByAccount(inputAccount)
        .then(res => {
          if(res.data.code == 200) {
            const member = res.data.memberData;
            //  檢查是否已加入
            const exists = this.invitedMenbers.some(m => m.account == member.account);
            if(exists) {
              Swal.fire('重複', '該帳號已在成員清單中', 'warning');
              return;
            }

            this.invitedMenbers.push({ name: member.name, account: member.account});
            Swal.fire('成功', `已新增：${member.name}`, 'success');
          }
          else{
            Swal.fire('失敗', '查無該帳號', 'error');
          }
        })
        .catch(() => {
          Swal.fire('錯誤', '查詢失敗，請稍後再試', 'error');
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/home']);
  }

  submit(): void {
    if(!this.familyName.trim()) {
      Swal.fire('錯誤', '請輸入家庭名稱', 'warning');
      return;
    }

    const payload = {
      name: this.familyName,
      owner: this.account,
      invitor: this.invitedMenbers.map(member => member.account)
    };

    this.apiService.createFamily(payload)
    .then(res => {
      if(res.data.code == 200) {
        Swal.fire('成功', '家庭群組已建立', 'success')
        .then(() => {
          this.router.navigate(['/home']);
        });
      }
      else{
        Swal.fire('失敗', res.data.message || '建立失敗', 'error');
      }
    })
    .catch(err => {
      console.error("建立家庭群組失敗", err);
      Swal.fire('錯誤', '伺服器錯誤，請稍後再試', 'error');
    });
  }

}
