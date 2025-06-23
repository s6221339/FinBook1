import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberConfirmComponent } from './member-confirm.component';

describe('MemberConfirmComponent', () => {
  let component: MemberConfirmComponent;
  let fixture: ComponentFixture<MemberConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberConfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
