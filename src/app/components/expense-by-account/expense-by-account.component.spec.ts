import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseByAccountComponent } from './expense-by-account.component';

describe('ExpenseByAccountComponent', () => {
  let component: ExpenseByAccountComponent;
  let fixture: ComponentFixture<ExpenseByAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseByAccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseByAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
