import { TestBed } from '@angular/core/testing';

import { EditFamilyPaymentService } from './edit-family-payment.service';

describe('EditFamilyPaymentService', () => {
  let service: EditFamilyPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditFamilyPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
