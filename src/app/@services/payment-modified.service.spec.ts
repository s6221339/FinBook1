import { TestBed } from '@angular/core/testing';

import { PaymentModifiedService } from './payment-modified.service';

describe('PaymentModifiedService', () => {
  let service: PaymentModifiedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentModifiedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
