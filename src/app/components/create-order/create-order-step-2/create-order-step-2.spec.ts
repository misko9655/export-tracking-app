import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrderStep2 } from './create-order-step-2';

describe('CreateOrderStep2', () => {
  let component: CreateOrderStep2;
  let fixture: ComponentFixture<CreateOrderStep2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrderStep2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOrderStep2);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
