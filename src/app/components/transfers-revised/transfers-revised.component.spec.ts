import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransfersRevisedComponent } from './transfers-revised.component';

describe('TransfersRevisedComponent', () => {
  let component: TransfersRevisedComponent;
  let fixture: ComponentFixture<TransfersRevisedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransfersRevisedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransfersRevisedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
