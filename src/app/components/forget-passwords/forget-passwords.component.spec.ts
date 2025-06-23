import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgetPasswordsComponent } from './forget-passwords.component';

describe('ForgetPasswordsComponent', () => {
  let component: ForgetPasswordsComponent;
  let fixture: ComponentFixture<ForgetPasswordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgetPasswordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgetPasswordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
