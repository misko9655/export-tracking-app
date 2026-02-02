import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrderStep1 } from './create-order-step-1';

describe('CreateOrderStep1', () => {
  let component: CreateOrderStep1;
  let fixture: ComponentFixture<CreateOrderStep1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrderStep1]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOrderStep1);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
