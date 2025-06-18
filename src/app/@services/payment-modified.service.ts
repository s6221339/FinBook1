import { Injectable } from '@angular/core';
import { PaymentIdFormData } from '../models/paymentIdFormData';

@Injectable({
  providedIn: 'root'
})
export class PaymentModifiedService {

  constructor() { }

  private paymentTempFormData: PaymentIdFormData | null = null;

  setPaymentFormData(data: PaymentIdFormData){
    this.paymentTempFormData = data;
  }

  getPaymentFormData(): PaymentIdFormData | null{
    return this.paymentTempFormData;
  }

  cleanPaymentFormData(){
    this.paymentTempFormData = null;
  }

}
