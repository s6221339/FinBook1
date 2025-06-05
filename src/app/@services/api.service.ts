import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor() { }

  //  創建帳款類型
  createType(data: any){
    return axios({
      url: 'http://localhost:8080/finbook/createType',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true,
      data
    });
  }

  //  帳款類型應用帳號
  getTypeByAccount(account: string){
    return axios.post('http://localhost:8080/finbook/getType', null, {
      params: { account },
      withCredentials: true
    });
  }

}
