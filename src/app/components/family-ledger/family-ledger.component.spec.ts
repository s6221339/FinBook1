import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyLedgerComponent } from './family-ledger.component';

describe('FamilyLedgerComponent', () => {
  let component: FamilyLedgerComponent;
  let fixture: ComponentFixture<FamilyLedgerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamilyLedgerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FamilyLedgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
