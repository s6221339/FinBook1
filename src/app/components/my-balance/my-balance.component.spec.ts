import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBalanceComponent } from './my-balance.component';

describe('MyBalanceComponent', () => {
  let component: MyBalanceComponent;
  let fixture: ComponentFixture<MyBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyBalanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
