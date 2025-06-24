import { ApiService } from './../../@services/api.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Family } from '../../models/family';

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
    private apiService: ApiService
  ){}

  familyId: number | null = null;
  account: string = "a6221339@yahoo.com.tw";
  familyData: Family | null = null;
  displayFamilyName: string = '';
  selectedAccounts: Set<string> = new Set();  //  勾選帳號集合
  isAllSelected: boolean = false;

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

}
