import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishSubscriptionComponent } from './publish-subscription.component';

describe('PublishSubscriptionComponent', () => {
  let component: PublishSubscriptionComponent;
  let fixture: ComponentFixture<PublishSubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishSubscriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublishSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
