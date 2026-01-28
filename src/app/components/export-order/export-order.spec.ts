import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportOrder } from './export-order';

describe('ExportOrder', () => {
  let component: ExportOrder;
  let fixture: ComponentFixture<ExportOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportOrder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportOrder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
