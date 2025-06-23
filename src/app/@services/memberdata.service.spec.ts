import { TestBed } from '@angular/core/testing';

import { MemberdataService } from './memberdata.service';

describe('MemberdataService', () => {
  let service: MemberdataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MemberdataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
