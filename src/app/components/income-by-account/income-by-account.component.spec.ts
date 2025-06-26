import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeByAccountComponent } from './income-by-account.component';

describe('IncomeByAccountComponent', () => {
  let component: IncomeByAccountComponent;
  let fixture: ComponentFixture<IncomeByAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeByAccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeByAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
