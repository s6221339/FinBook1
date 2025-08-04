import { Injectable } from '@angular/core';
import { PaymentInfos } from '../models/PaymentInfos';

@Injectable({
  providedIn: 'root'
})
export class EditFamilyPaymentService {

  private editingPayment: PaymentInfos | null = null;

  setPayment(p: PaymentInfos): void {
    this.editingPayment = p;
  }

  getPayment(): PaymentInfos | null {
    return this.editingPayment;
  }

  clear(): void {
    this.editingPayment = null;
  }

}
