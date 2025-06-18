import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyPaymentComponent } from './modify-payment.component';

describe('ModifyPaymentComponent', () => {
  let component: ModifyPaymentComponent;
  let fixture: ComponentFixture<ModifyPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifyPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifyPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
