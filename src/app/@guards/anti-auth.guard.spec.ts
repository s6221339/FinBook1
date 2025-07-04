import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { antiAuthGuard } from './anti-auth.guard';

describe('antiAuthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => antiAuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
