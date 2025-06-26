import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeExpenseTrendChartComponent } from './income-expense-trend-chart.component';

describe('IncomeExpenseTrendChartComponent', () => {
  let component: IncomeExpenseTrendChartComponent;
  let fixture: ComponentFixture<IncomeExpenseTrendChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeExpenseTrendChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeExpenseTrendChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
