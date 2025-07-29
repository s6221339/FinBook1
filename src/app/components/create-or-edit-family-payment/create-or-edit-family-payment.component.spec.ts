import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrEditFamilyPaymentComponent } from './create-or-edit-family-payment.component';

describe('CreateOrEditFamilyPaymentComponent', () => {
  let component: CreateOrEditFamilyPaymentComponent;
  let fixture: ComponentFixture<CreateOrEditFamilyPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrEditFamilyPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOrEditFamilyPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
