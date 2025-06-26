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
    private apiService: ApiService
  ){}

  account: string = "a6221339@yahoo.com.tw";
  invitationList: { familyId: number; familyName: string; statusText: string }[] = [];

  ngOnInit(): void {
    this.apiService.getFamilyInvitationByAccount(this.account)
      .then(res => {
        if(Array.isArray(res.data)) {
          this.invitationList = res.data;
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

  goHome(){
    this.router.navigate(['/home']);
  }

}
