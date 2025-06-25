import { ApiService } from './../../@services/api.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Family } from '../../models/family';
import Swal from 'sweetalert2';
import { FamilyMember } from '../../models/familyMember';

@Component({
  selector: 'app-family-management',
  imports: [],
  templateUrl: './family-management.component.html',
  styleUrl: './family-management.component.scss',
  standalone: true
})
export class FamilyManagementComponent implements OnInit{

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router
  ){}

  familyId: number | null = null;
  account: string = "a6221339@yahoo.com.tw";
  familyData: Family | null = null;
  displayFamilyName: string = '';
  selectedAccounts: Set<string> = new Set();  //  勾選帳號集合
  isAllSelected: boolean = false;
  showInviteList: boolean = false;
  invitingMembers: FamilyMember[] = [];

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('familyId');
      this.familyId = id ? +id : null;

      if(this.familyId !== null) {
        this.loadFamilyData();
      }
    });
  }

  loadFamilyData(): void {
    this.apiService.getFamilyByAccount(this.account)
    .then(res => {
      if(res.data.code == 200) {
        const list: Family[] = res.data.familyList;
        this.familyData = list.find(f => f.id == this.familyId) || null;

        //  如果找到對應家庭，再設定 displayFamilyName
        if(this.familyData) {
          this.displayFamilyName = this.familyData.name?.trim() !== ''
            ? this.familyData.name
            : '🆔：' + this.familyData.id;
        }
      }
    })
    .catch(err => {
      console.error('取得家庭資料失敗', err);
      alert('取得家庭資料失敗');
    });
  }

  onToggleMember(account: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if(checked){
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

    if(checked && this.familyData?.memberList) {
      this.familyData.memberList.forEach(m => this.selectedAccounts.add(m.account));
    }
    else{
      this.selectedAccounts.clear();
    }
  }

  private syncSelectAllState(): void {
    const total = this.familyData?.memberList?.length || 0;
    this.isAllSelected = total > 0 && this.selectedAccounts.size == total;
  }

  renameFamilyName(): void {
    Swal.fire({
      title: '請更改家庭名稱',
      input: 'text',
      inputLabel: '請輸入新的家庭名稱',
      inputPlaceholder: '輸入名稱...',
      showCancelButton: true,
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      inputValidator: (value) => {
        if(!value || value.trim() == '') {
          return '名稱不能為空';
        }
        return null;
      }
    })
    .then((result) => {
      if(result.isConfirmed && result.value.trim() !== '' && this.familyId !== null) {
        const payload = {
          familyId: this.familyId,
          owner: this.account,
          newName: result.value.trim()
        };

        this.apiService.renameFamily(payload)
          .then(res => {
            if(res.data.code == 200){
              Swal.fire('成功！', '家庭名稱已更新', 'success');
              //  更新畫面上的 displayName
              this.displayFamilyName = payload.newName;
            }
            else{
              Swal.fire('失敗', res.data.message || '無法更新名稱', 'error');
            }
          })
          .catch(err => {
            console.error('更新家庭名稱失敗', err);
            Swal.fire('錯誤', '伺服器錯誤，請稍後再試', 'error');
          });
      }
    });
  }

  inviteMember(): void {
    if(!this.familyId || !this.familyData) return;

    Swal.fire({
      title: '請輸入要邀請的帳號',
      input: 'text',
      inputLabel: '請輸入對方帳號（Email）',
      inputPlaceholder: 'ex：example@gamil.com',
      showCancelButton: true,
      confirmButtonText: '送出邀請',
      cancelButtonText: '取消',
      inputValidator: (value) => {
        if(!value || value.trim() == '') {
          return '帳號不能為空';
        }
        if(value.trim() == this.familyData!.owner.account) {
          return '無法邀請家庭擁有者加入群組'
        }
        return null;
      }
    })
    .then(result => {
      if(result.isConfirmed && result.value.trim() !== '') {
        const inviteAccount = result.value.trim();

        const payload = {
          familyId: this.familyId,
          owner: this.account,
          invitor: [inviteAccount]
        };

        this.apiService.inviteFamilymember(payload)
          .then(res => {
            if(res.data.code == 200){
              Swal.fire('✅ 成功', '邀請已送出', 'success');
            }
            else{
              Swal.fire('❌ 失敗', res.data.message || '邀請失敗', 'error');
            }
          })
          .catch(err => {
            console.error('邀請成員錯誤', err);
            Swal.fire('錯誤', '伺服器錯誤，請稍後再試', 'error');
          });
      }
    });
  }

  removeSelectedMembers(): void {
    if(!this.familyId || !this.familyData) return;

    const toKick = Array.from(this.selectedAccounts);

    if(toKick.length == 0) {
      Swal.fire('⚠️ 警告', '請先勾選要踢除的成員', 'warning');
      return;
    }

    Swal.fire({
      title: '確定要踢除這些成員嗎？',
      html: toKick.map(account => `<div>${account}</div>`).join(''),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '踢除',
      cancelButtonText: '取消'
    })
    .then(result => {
      if(result.isConfirmed) {
        //  串型或並行發送 API 請求
        const payload = {
          familyId: this.familyId,
          owner: this.account,
          memberAccounts: toKick
        };

        this.apiService.removeFamilyMember(payload)
          .then(res => {
            if(res.data.code == 200){
              Swal.fire('✅ 成功', `成功踢除 ${toKick.length} 名成員`, 'success');
              this.selectedAccounts.clear();
              this.loadFamilyData();
            }
            else{
              Swal.fire('❌ 失敗', res.data.message || '無法踢除成員', 'error');
            }
            })
            .catch(err => {
              console.error('踢除失敗', err);
              Swal.fire('錯誤', '伺服器錯誤，請稍後再試', 'error');
            });
      }
    });
  }

  transferFamilyOwner(): void {
    if(!this.familyId || !this.familyData) return;

    const selected = Array.from(this.selectedAccounts);

    //  檢查是否只選一位
    if(selected.length == 0) {
      Swal.fire('⚠️ 警告', '請先選擇一位要轉讓的成員','warning');
      return;
    }

    if(selected.length > 1) {
      Swal.fire('⚠️ 警告', '一次只能轉讓給一位成員', 'warning');
      return;
    }

    const newOwner = selected[0];

    Swal.fire({
      title: '確定要轉讓族長給這位成員嗎？',
      html: `<b>${newOwner}</b>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '確認轉讓',
      cancelButtonText: '取消'
    })
    .then(result => {
      if(result.isConfirmed) {
        const payload = {
          familyId: this.familyId,
          oldOwner: this.account,
          newOwner: newOwner
        };

        this.apiService.transferOwner(payload)
          .then(res => {
            if(res.data.code == 200) {
              Swal.fire('✅ 成功', '已成功轉讓族長身分', 'success');
              this.selectedAccounts.clear;  //  清除勾選
              this.loadFamilyData();  //  重新載入畫面
            }
            else{
              Swal.fire('❌ 失敗', res.data.message || '轉讓失敗', 'error');
            }
          })
          .catch(err => {
            console.error('轉讓族長錯誤', err);
            Swal.fire('錯誤', '伺服器錯誤，請稍後再試', 'error');
          });
      }
    });
  }

  disbandFamily(): void {
    if(!this.familyId || !this.familyData) return;

    if(this.account !== this.familyData.owner.account){
      Swal.fire('⚠️ 無權限', '只有家庭擁有者可以解散群組', 'warning');
      return;
    }

    Swal.fire({
      title: '⚠️確定要解散此家庭嗎？',
      html: '請輸入 <b>「DISBAND」</b>作為驗證碼以確認操作',
      input: 'text',
      inputPlaceholder: '輸入驗證碼...',
      showCancelButton: true,
      confirmButtonText: '確認解散',
      cancelButtonText: '取消',
      inputValidator: (value) => {
        if(!value || value.trim().toUpperCase() !== 'DISBAND') {
          return '驗證碼錯誤，請輸入「DISBAND」';
        }
        return null;
      }
    })
    .then(result => {
      if(result.isConfirmed) {
        const payload = {
          familyId: this.familyId,
          owner: this.account
        };

        this.apiService.disbandFamily(payload)
          .then(res => {
            if(res.data.code == 200) {
              Swal.fire('✅ 成功', '家庭已解散', 'success')
              .then(() => {
                //  返回首頁
                this.router.navigate(['/myFamily']);
              });
            }
            else{
              Swal.fire('❌ 失敗', res.data.message || '解散失敗', 'error');
            }
          })
          .catch(err => {
            console.error('解散家庭失敗', err);
            Swal.fire('錯誤', '伺服器錯誤，請稍後再試', 'error');
          });
      }
    });
  }

  toggleInviteList(): void {
    this.showInviteList = !this.showInviteList;

    //  如果是展開，才載入資料
    if(this.showInviteList && this.familyId !== null) {
      this.apiService.getUnacceptedFamilyInvitation(this.familyId)
      .then(res => {
        this.invitingMembers = res.data.inviteeList || [];
      })
      .catch(err => {
        console.error('取得邀請中成員失敗', err);
        Swal.fire('錯誤', '無法取得邀請名單', 'error');
      });
    }
  }

}
