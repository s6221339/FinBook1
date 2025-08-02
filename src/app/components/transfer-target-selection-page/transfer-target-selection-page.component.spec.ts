import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferTargetSelectionPageComponent } from './transfer-target-selection-page.component';

describe('TransferTargetSelectionPageComponent', () => {
  let component: TransferTargetSelectionPageComponent;
  let fixture: ComponentFixture<TransferTargetSelectionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferTargetSelectionPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferTargetSelectionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
