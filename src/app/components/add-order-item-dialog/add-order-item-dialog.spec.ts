import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrderItemDialog } from './add-order-item-dialog';

describe('AddOrderItemDialog', () => {
  let component: AddOrderItemDialog;
  let fixture: ComponentFixture<AddOrderItemDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOrderItemDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOrderItemDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
