import { AuthService } from './../../@services/auth.service';
import { ApiService } from './../../@services/api.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Family } from '../../models/family';
import Swal from 'sweetalert2';
import { FamilyMember } from '../../models/familyMember';

@Component({
  selector: 'app-my-family',
  imports: [],
  templateUrl: './my-family.component.html',
  styleUrl: './my-family.component.scss',
  standalone: true
})
export class MyFamilyComponent implements OnInit {

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ){}

  familyList: Family[] = [];

  ngOnInit(): void {
    this.apiService.getFamilyByAccount(this.currentAccount)
    .then(res => {
      if(res.data.code == 200) {
        this.familyList = res.data.familyList;
      }
    })
    .catch(err => {
      console.error('取得家庭列表失敗', err);
      alert('取得家庭列表失敗');
    });
  }

  get currentAccount(): string {
    const user = this.authService.getCurrentUser();
    if(!user) {
      Swal.fire('錯誤', '尚未登入，請重新登入', 'error');
      this.router.navigate(['/login']);
      throw new Error('尚未登入');
    }
    return user.account;
  }

  goFamilyManagement(familyId: number): void {
    this.router.navigate(['/familyManagement'], {
      queryParams: { familyId }
    });
  }

  getMemberNames(memberList: FamilyMember[] | undefined | null): string {
    if(!memberList || memberList.length == 0){
      return '(無成員)';
    }
    return memberList.map(m => m.name).join(', ');
  }

}
