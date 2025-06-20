import { ApiService } from './../../@services/api.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-balance',
  imports: [],
  templateUrl: './my-balance.component.html',
  styleUrl: './my-balance.component.scss'
})
export class MyBalanceComponent implements OnInit{

  constructor(
    private apiService: ApiService
  ){}

  account: string= 'a6221339';

  ngOnInit(): void {

  }

}
