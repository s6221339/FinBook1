import { Injectable } from '@angular/core';
import { PaymentFormData } from '../models/paymentFormData';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor() { }

  private tempFormData: PaymentFormData | null = null;

  setFormData(data: PaymentFormData){
    this.tempFormData = data;
  }

  getFormData(): PaymentFormData | null{
    return this.tempFormData;
  }

  cleanFormData(){
    this.tempFormData = null;
  }

}
