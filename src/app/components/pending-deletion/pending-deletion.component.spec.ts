import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingDeletionComponent } from './pending-deletion.component';

describe('PendingDeletionComponent', () => {
  let component: PendingDeletionComponent;
  let fixture: ComponentFixture<PendingDeletionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingDeletionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingDeletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
