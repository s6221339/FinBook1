import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedIncomeExpenseFormComponent } from './fixed-income-expense-form.component';

describe('FixedIncomeExpenseFormComponent', () => {
  let component: FixedIncomeExpenseFormComponent;
  let fixture: ComponentFixture<FixedIncomeExpenseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FixedIncomeExpenseFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FixedIncomeExpenseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
