import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberCenterComponent } from './member-center.component';

describe('MemberCenterComponent', () => {
  let component: MemberCenterComponent;
  let fixture: ComponentFixture<MemberCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberCenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
