import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Supply } from './supply';

describe('Supply', () => {
  let component: Supply;
  let fixture: ComponentFixture<Supply>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Supply]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Supply);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
