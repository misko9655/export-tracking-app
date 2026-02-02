import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfOrders } from './list-of-orders';

describe('ListOfOrders', () => {
  let component: ListOfOrders;
  let fixture: ComponentFixture<ListOfOrders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListOfOrders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListOfOrders);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
