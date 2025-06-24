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
    private apiService: ApiService
  ){}

  account: string = "a6221339@yahoo.com.tw";
  familyList: Family[] = [];

  ngOnInit(): void {
    this.apiService.getFamilyByAccount(this.account)
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
