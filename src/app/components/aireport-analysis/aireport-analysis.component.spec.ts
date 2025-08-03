import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AIReportAnalysisComponent } from './aireport-analysis.component';

describe('AIReportAnalysisComponent', () => {
  let component: AIReportAnalysisComponent;
  let fixture: ComponentFixture<AIReportAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AIReportAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AIReportAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
