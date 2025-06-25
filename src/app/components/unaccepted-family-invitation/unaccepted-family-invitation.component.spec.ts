import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnacceptedFamilyInvitationComponent } from './unaccepted-family-invitation.component';

describe('UnacceptedFamilyInvitationComponent', () => {
  let component: UnacceptedFamilyInvitationComponent;
  let fixture: ComponentFixture<UnacceptedFamilyInvitationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnacceptedFamilyInvitationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnacceptedFamilyInvitationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
