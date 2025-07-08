import { AuthService } from './../../@services/auth.service';
import { ApiService } from './../../@services/api.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-unaccepted-family-invitation',
  imports: [],
  templateUrl: './unaccepted-family-invitation.component.html',
  styleUrl: './unaccepted-family-invitation.component.scss'
})
export class UnacceptedFamilyInvitationComponent implements OnInit{

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ){}

  invitationList: { familyId: number; familyName: string; statusText: string }[] = [];

  ngOnInit(): void {
    const account = this.authService.getCurrentUser()?.account;

    if(!account) {
      Swal.fire({
        icon: 'error',
        title: '尚未登入',
        text: '請先登入以查看家族邀請',
        confirmButtonText: '確定'
      });
      return;
    }

    this.apiService.getFamilyInvitationByAccount(account)
      .then(res => {
        if(Array.isArray(res.data.list)) {
          this.invitationList = res.data.list;
        }
      })
      .catch(err => {
        console.error('取得邀請清單失敗', err);
        Swal.fire({
          icon: 'error',
          title: '取得失敗',
          text: '無法取得邀請清單，請稍後再試',
          confirmButtonText: '確定'
        });
      });
  }

  acceptInvite(familyId: number): void {
    const account = this.authService.getCurrentUser()?.account;
    if(!account) return;

    const data = {
      account: account,
      familyId: familyId
    };

    this.apiService.acceptFamilyInvitation(data)
      .then(res => {
        Swal.fire({
          icon: 'success',
          title: '邀請已接受',
          text: '你已成功加入家庭',
          confirmButtonText: '確定'
        });

        //  更新列表，移除已處理邀請
        this.invitationList = this.invitationList.filter(i => i.familyId !== familyId);
      })
      .catch(err => {
        console.error('接受邀請失敗', err);
        Swal.fire({
          icon: 'error',
          title: '處理失敗',
          text: '無法接受邀請，請稍後再試',
          confirmButtonText: '確定'
        });
      });
  }

  rejectInvite(familyId: number): void {
    const account = this.authService.getCurrentUser()?.account;
    if(!account) return;

    const data = {
      account: account,
      familyId: familyId
    };

    this.apiService.rejectFamilyInvitation(data)
      .then(res => {
        Swal.fire({
          icon: 'info',
          title: '邀請已拒絕',
          text: '你已拒絕加入該家庭',
          confirmButtonText: '確定'
        });

        //  移除已處理的邀請
        this.invitationList = this.invitationList.filter(i => i.familyId !== familyId);
      })
      .catch(err => {
        console.error('拒絕邀請失敗', err);
        Swal.fire({
          icon: 'error',
          title: '處理失敗',
          text: '無法拒絕邀請，請稍後再試',
          confirmButtonText: '確定'
        });
      });
  }

  goHome(){
    this.router.navigate(['/home']);
  }

}
