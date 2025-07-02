import { AuthService } from './../../@services/auth.service';
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
    private apiService: ApiService,
    private authService: AuthService
  ){}

  creatorName: string = "載入中...";
  familyName: string = '';
  invitedMenbers: { name: string; account: string }[] = [];
  ownerAccount: string = '';
  selectedAccounts: Set<string> = new Set();
  isAllSelected: boolean = false;

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();

    if(user) {
      this.creatorName = user.name;
      this.ownerAccount = user.account;
    }
    else{
      //  安全防呆：如果沒登入或抓不到帳號，導回首頁
      this.router.navigate(['/home']);
    }
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
        if(inputAccount == this.ownerAccount){
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

  //  批次移除邀請成員
  removeSelectedMembers(): void {
    const toRemove = Array.from(this.selectedAccounts);
    if(toRemove.length == 0) {
      Swal.fire('⚠️', '請先勾選要取消邀請的成員', 'warning');
      return;
    }

    Swal.fire({
      title: '確定要取消這些邀請嗎？',
      html: toRemove.map(account => `<div>${account}</div>`).join(''),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '確認取消',
      cancelButtonText: '返回'
    }).then(result => {
      if(result.isConfirmed){
        this.invitedMenbers = this.invitedMenbers.filter(m => !this.selectedAccounts.has(m.account));
        this.selectedAccounts.clear();
        this.isAllSelected = false;
        Swal.fire('✅ 已取消', '選定的邀請成員已移除', 'success');
      }
    });
  }

  onToggleMember(account: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if(checked) {
      this.selectedAccounts.add(account);
    }
    else{
      this.selectedAccounts.delete(account);
    }
    this.syncSelectAllState();
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.isAllSelected = checked;

    if(checked) {
      this.invitedMenbers.forEach(m => this.selectedAccounts.add(m.account));
    }
    else{
      this.selectedAccounts.clear();
    }
  }

  private syncSelectAllState(): void {
    const total = this.invitedMenbers.length;
    this.isAllSelected = total > 0 && this.selectedAccounts.size == total;
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
      owner: this.ownerAccount,
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
