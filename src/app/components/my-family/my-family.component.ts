import { AuthService } from './../../@services/auth.service';
import { ApiService } from './../../@services/api.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Family } from '../../models/family';
import Swal from 'sweetalert2';
import { FamilyMember } from '../../models/familyMember';
import { MatIconModule } from "@angular/material/icon"
import { CommonModule } from "@angular/common"
import { MatTableModule, MatTableDataSource } from "@angular/material/table"
import { CustomPaginatorComponent } from "../custom-paginator/custom-paginator.component"

@Component({
  selector: 'app-my-family',
  imports: [MatIconModule, CommonModule, MatTableModule, CustomPaginatorComponent],
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
  dataSource = new MatTableDataSource<Family>()
  displayedColumns: string[] = ["name", "owner", "members", "actions"]

  // 分頁相關
  currentPage = 1
  pageSize = 5
  pageSizeOptions: number[] = [5, 10, 20, 50]
  totalItems = 0

  ngOnInit(): void {
    this.loadFamilyList()
  }

  loadFamilyList(): void {
    this.apiService
      .getFamilyByAccount(this.currentAccount)
      .then((res) => {
        if (res.data.code == 200) {
          this.familyList = res.data.familyList
          this.totalItems = this.familyList.length
          this.updateDataSource()
        }
      })
      .catch((err) => {
        console.error("取得家庭列表失敗", err)
        Swal.fire({
          icon: "error",
          title: "錯誤",
          text: "取得家庭列表失敗",
          confirmButtonText: "確定",
        })
      })
  }

  updateDataSource(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize
    const endIndex = startIndex + this.pageSize
    this.dataSource.data = this.familyList.slice(startIndex, endIndex)
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage
    this.updateDataSource()
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize
    this.currentPage = 1
    this.updateDataSource()
  }

  get currentAccount(): string {
    const user = this.authService.getCurrentUser();
    if(!user) {
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
